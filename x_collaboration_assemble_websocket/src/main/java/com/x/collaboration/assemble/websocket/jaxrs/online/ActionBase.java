package com.x.collaboration.assemble.websocket.jaxrs.online;

import java.lang.reflect.Type;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;

import javax.websocket.Session;

import org.apache.commons.lang3.StringUtils;

import com.google.gson.reflect.TypeToken;
import com.x.base.core.DefaultCharset;
import com.x.base.core.application.Application;
import com.x.base.core.http.WrapInListString;
import com.x.base.core.http.WrapOutOnline;
import com.x.base.core.project.x_collaboration_assemble_websocket;
import com.x.base.core.utils.ListTools;
import com.x.collaboration.assemble.websocket.ThisApplication;

public class ActionBase {

	private static Type collectionType = new TypeToken<ArrayList<WrapOutOnline>>() {
	}.getType();

	protected Boolean getOnlineLocal(String person) throws Exception {
		Session session = ThisApplication.connections.get(person);
		return (null == session || (!session.isOpen())) ? false : true;
	}

	protected Boolean getOnLineRemote(String person) throws Exception {
		List<Application> list = ThisApplication.applications.get(x_collaboration_assemble_websocket.class);
		if (ListTools.isNotEmpty(list)) {
			for (Application application : list) {
				if (!StringUtils.equals(application.getToken(), ThisApplication.token)) {
					WrapOutOnline wrap = ThisApplication.applications.getQuery(application,
							"online/person/" + URLEncoder.encode(person, DefaultCharset.name) + "/local",
							WrapOutOnline.class);
					if (StringUtils.equals(wrap.getOnlineStatus(), WrapOutOnline.status_online)) {
						return true;
					}
				}
			}
		}
		return false;
	}

	protected List<WrapOutOnline> listOnlineLocal(WrapInListString wrapIn) throws Exception {
		List<WrapOutOnline> wraps = new ArrayList<>();
		if (ListTools.isNotEmpty(wrapIn.getValueList())) {
			for (String str : wrapIn.getValueList()) {
				WrapOutOnline o = new WrapOutOnline();
				o.setPerson(str);
				o.setOnlineStatus(WrapOutOnline.status_offline);
				wraps.add(o);
			}
			for (WrapOutOnline o : wraps) {
				Session session = ThisApplication.connections.get(o.getPerson());
				if ((null != session) && (session.isOpen())) {
					o.setOnlineStatus(WrapOutOnline.status_online);
				}
			}
		}
		return wraps;
	}

	protected List<WrapOutOnline> listOnLineRemote(WrapInListString wrapIn) throws Exception {
		List<WrapOutOnline> wraps = new ArrayList<>();
		if (ListTools.isNotEmpty(wrapIn.getValueList())) {
			for (String str : wrapIn.getValueList()) {
				WrapOutOnline o = new WrapOutOnline();
				o.setPerson(str);
				o.setOnlineStatus(WrapOutOnline.status_offline);
				wraps.add(o);
			}
			List<Application> list = ThisApplication.applications.get(x_collaboration_assemble_websocket.class);
			if (ListTools.isEmpty(list)) {
				for (Application application : list) {
					if (!StringUtils.equals(application.getToken(), ThisApplication.token)) {
						List<WrapOutOnline> results = ThisApplication.applications.getQuery(application,
								"online/list/local", collectionType);
						for (WrapOutOnline o : results) {
							if (StringUtils.equals(WrapOutOnline.status_online, o.getOnlineStatus())) {
								for (WrapOutOnline wrap : wraps) {
									if (StringUtils.equals(wrap.getPerson(), o.getPerson())) {
										wrap.setOnlineStatus(WrapOutOnline.status_online);
										break;
									}
								}
							}
						}
					}
				}
			}
		}
		return wraps;
	}

	protected List<WrapOutOnline> listOnlineAllLocal() throws Exception {
		List<WrapOutOnline> wraps = new ArrayList<>();
		for (Entry<String, Session> entry : ThisApplication.connections.entrySet()) {
			Session session = entry.getValue();
			if ((null != session) && (session.isOpen())) {
				WrapOutOnline o = new WrapOutOnline();
				o.setPerson(entry.getKey());
				o.setOnlineStatus(WrapOutOnline.status_online);
				wraps.add(o);
			}
		}
		return wraps;
	}

	protected List<WrapOutOnline> listOnLineAllRemote() throws Exception {
		Set<String> set = new HashSet<>();
		List<Application> list = ThisApplication.applications.get(x_collaboration_assemble_websocket.class);
		if (ListTools.isEmpty(list)) {
			for (Application application : list) {
				if (!StringUtils.equals(application.getToken(), ThisApplication.token)) {
					List<WrapOutOnline> results = ThisApplication.applications.getQuery(application,
							"online/list/all/local", collectionType);
					for (WrapOutOnline o : results) {
						set.add(o.getPerson());
					}
				}
			}
		}
		List<WrapOutOnline> wraps = new ArrayList<>();
		for (String str : set) {
			WrapOutOnline wrap = new WrapOutOnline();
			wrap.setPerson(str);
			wrap.setOnlineStatus(WrapOutOnline.status_online);
			wraps.add(wrap);
		}
		return wraps;
	}

}
