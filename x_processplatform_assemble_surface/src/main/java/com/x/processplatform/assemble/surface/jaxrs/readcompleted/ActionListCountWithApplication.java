package com.x.processplatform.assemble.surface.jaxrs.readcompleted;

import java.util.List;
import java.util.Objects;

import com.x.base.core.bean.NameValueCountPair;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.http.ActionResult;
import com.x.base.core.http.EffectivePerson;
import com.x.processplatform.assemble.surface.Business;

public class ActionListCountWithApplication extends ActionBase {

	ActionResult<List<NameValueCountPair>> execute(EffectivePerson effectivePerson) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<NameValueCountPair>> result = new ActionResult<>();
			Business business = new Business(emc);
			List<NameValueCountPair> wraps = listApplicationPair(business, effectivePerson);
			for (NameValueCountPair o : wraps) {
				o.setCount(this.countWithApplication(business, effectivePerson, Objects.toString(o.getValue())));
			}
			result.setData(wraps);
			return result;
		}
	}

}