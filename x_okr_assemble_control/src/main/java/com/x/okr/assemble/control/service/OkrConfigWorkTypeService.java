package com.x.okr.assemble.control.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.x.base.core.bean.BeanCopyTools;
import com.x.base.core.bean.BeanCopyToolsBuilder;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.okr.assemble.control.Business;
import com.x.okr.assemble.control.jaxrs.okrconfigworktype.WrapInOkrConfigWorkType;
import com.x.okr.entity.OkrConfigWorkType;

/**
 * 类   名：OkrConfigWorkTypeService<br/>
 * 实体类：OkrConfigWorkType<br/>
 * 作   者：Liyi<br/>
 * 单   位：O2 Team<br/>
 * 日   期：2016-05-20 17:17:26
**/
public class OkrConfigWorkTypeService{
	private Logger logger = LoggerFactory.getLogger( OkrConfigWorkTypeService.class );
	private BeanCopyTools<WrapInOkrConfigWorkType, OkrConfigWorkType> wrapin_copier = BeanCopyToolsBuilder.create( WrapInOkrConfigWorkType.class, OkrConfigWorkType.class, null, WrapInOkrConfigWorkType.Excludes );
	/**
	 * 根据传入的ID从数据库查询OkrConfigWorkType对象
	 * @param id
	 * @return
	 * @throws Exception
	 */
	public OkrConfigWorkType get( String id ) throws Exception {
		if( id  == null || id.isEmpty() ){
			throw new Exception( "id is null, return null!" );
		}
		try ( EntityManagerContainer emc = EntityManagerContainerFactory.instance().create() ) {
			return emc.find( id, OkrConfigWorkType.class );
		}catch( Exception e ){
			throw e;
		}
	}
	
	/**
	 * 向数据库保存OkrConfigWorkType对象
	 * @param wrapIn
	 */
	public OkrConfigWorkType save( WrapInOkrConfigWorkType wrapIn ) throws Exception {
		OkrConfigWorkType okrConfigWorkType = null;
		if( wrapIn.getId() !=null && wrapIn.getId().trim().length() > 20 ){
		//根据ID查询信息是否存在，如果存在就update，如果不存在就create
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				okrConfigWorkType =  emc.find( wrapIn.getId(), OkrConfigWorkType.class );
				if( okrConfigWorkType != null ){
					emc.beginTransaction( OkrConfigWorkType.class );
					wrapin_copier.copy( wrapIn, okrConfigWorkType );
					emc.check( okrConfigWorkType, CheckPersistType.all );	
					emc.commit();
				}else{
					okrConfigWorkType = new OkrConfigWorkType();
					emc.beginTransaction( OkrConfigWorkType.class );
					wrapin_copier.copy( wrapIn, okrConfigWorkType );
					okrConfigWorkType.setId( wrapIn.getId() );//使用参数传入的ID作为记录的ID
					emc.persist( okrConfigWorkType, CheckPersistType.all);	
					emc.commit();
				}
			}catch( Exception e ){
				logger.error( "OkrConfigWorkType update/ got a error!" );
				throw e;
			}
		}else{//没有传入指定的ID
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				okrConfigWorkType = new OkrConfigWorkType();
				emc.beginTransaction( OkrConfigWorkType.class );
				wrapin_copier.copy( wrapIn, okrConfigWorkType );
				emc.persist( okrConfigWorkType, CheckPersistType.all);	
				emc.commit();
			}catch( Exception e ){
				logger.error( "OkrConfigWorkType create got a error!", e);
				throw e;
			}
		}
		return okrConfigWorkType;
	}
	
	/**
	 * 根据ID从数据库中删除OkrConfigWorkType对象
	 * @param id
	 * @throws Exception
	 */
	public void delete( String id ) throws Exception {
		OkrConfigWorkType okrConfigWorkType = null;
		if( id == null || id.isEmpty() ){
			logger.error( "id is null, system can not delete any object." );
		}
		try ( EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			//先判断需要操作的应用信息是否存在，根据ID进行一次查询，如果不存在不允许继续操作
			okrConfigWorkType = emc.find(id, OkrConfigWorkType.class);
			if (null == okrConfigWorkType) {
				logger.error( "object is not exist {'id':'"+ id +"'}" );
			}else{
				emc.beginTransaction( OkrConfigWorkType.class );
				emc.remove( okrConfigWorkType, CheckRemoveType.all );
				emc.commit();
			}
		} catch ( Exception e ) {
			throw e;
		}
	}

	public List<OkrConfigWorkType> listAll() throws Exception {
		Business business = null;
		try ( EntityManagerContainer emc = EntityManagerContainerFactory.instance().create() ) {
			business = new Business(emc);
			return business.okrConfigWorkTypeFactory().listAll();
		}catch( Exception e ){
			throw e;
		}
	}
	
}
