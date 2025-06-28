/**
 * Notes: 登记表格报名实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-07-04 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class EnrollJoinModel extends BaseProjectModel {

}

// 集合名
EnrollJoinModel.CL = BaseProjectModel.C('enroll_join');

EnrollJoinModel.DB_STRUCTURE = {
	_pid: 'string|true',
	ENROLL_JOIN_ID: 'string|true',
	ENROLL_JOIN_ENROLL_ID: 'string|true|comment=报名PK',

	ENROLL_JOIN_IS_ADMIN: 'int|true|default=0|comment=是否管理员添加 0/1',

	ENROLL_JOIN_USER_ID: 'string|true|comment=用户ID', 
	ENROLL_JOIN_FORMS: 'array|true|default=[]|comment=表单',

	ENROLL_JOIN_STATUS: 'int|true|default=1|comment=状态 0=待审核 1=报名成功, 99=审核未过',
	ENROLL_JOIN_REASON: 'string|false|comment=审核拒绝或者取消理由',

	ENROLL_JOIN_LAST_TIME: 'int|true|default=0', 
	
	ENROLL_JOIN_ADD_TIME: 'int|true',
	ENROLL_JOIN_EDIT_TIME: 'int|true',
	ENROLL_JOIN_ADD_IP: 'string|false',
	ENROLL_JOIN_EDIT_IP: 'string|false',
};

// 字段前缀
EnrollJoinModel.FIELD_PREFIX = "ENROLL_JOIN_";

/**
 * 状态 0=待审核 1=报名成功, 99=审核未过 
 */
EnrollJoinModel.STATUS = {
	WAIT: 0,
	SUCC: 1, 
	ADMIN_CANCEL: 99
};

EnrollJoinModel.STATUS_DESC = {
	WAIT: '待审核',
	SUCC: '成功', 
	ADMIN_CANCEL: '审核未过'
}; 

module.exports = EnrollJoinModel;