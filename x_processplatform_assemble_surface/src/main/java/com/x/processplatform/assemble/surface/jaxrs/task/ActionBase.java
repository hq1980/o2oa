package com.x.processplatform.assemble.surface.jaxrs.task;

import com.x.base.core.application.jaxrs.StandardJaxrsAction;
import com.x.base.core.bean.BeanCopyTools;
import com.x.base.core.bean.BeanCopyToolsBuilder;
import com.x.processplatform.assemble.surface.wrapin.content.WrapInTask;
import com.x.processplatform.assemble.surface.wrapout.content.WrapOutAttachment;
import com.x.processplatform.assemble.surface.wrapout.content.WrapOutTask;
import com.x.processplatform.assemble.surface.wrapout.content.WrapOutWork;
import com.x.processplatform.core.entity.content.Attachment;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.entity.content.Work;

abstract class ActionBase extends StandardJaxrsAction {

	protected static BeanCopyTools<Task, WrapOutTask> taskOutCopier = BeanCopyToolsBuilder.create(Task.class,
			WrapOutTask.class, null, WrapOutTask.Excludes);

	protected static BeanCopyTools<WrapInTask, Task> taskInCopier = BeanCopyToolsBuilder.create(WrapInTask.class,
			Task.class, WrapInTask.Includes, null);

	protected static BeanCopyTools<Work, WrapOutWork> workOutCopier = BeanCopyToolsBuilder.create(Work.class,
			WrapOutWork.class, null, WrapOutWork.Excludes);

	protected static BeanCopyTools<Attachment, WrapOutAttachment> attachmentOutCopier = BeanCopyToolsBuilder
			.create(Attachment.class, WrapOutAttachment.class, null, WrapOutAttachment.Excludes);

}
