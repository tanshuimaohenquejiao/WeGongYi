/**
 * Notes: 活动模块后台管理-控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-06-23 10:20:00 
 */

const BaseProjectAdminController = require('./base_project_admin_controller.js');

const AdminEnrollService = require('../../service/admin/admin_enroll_service.js');
const EnrollService = require('../../service/enroll_service.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const contentCheck = require('../../../../framework/validate/content_check.js');
const EnrollModel = require('../../model/enroll_model.js');

class AdminEnrollController extends BaseProjectAdminController {

	/** 置顶与排序设定 */
	async sortEnroll() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			sort: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		await service.sortEnroll(input.id, input.sort);
	}

	/** 首页设定 */
	async vouchEnroll() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			vouch: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		await service.vouchEnroll(input.id, input.vouch);
	}

	/** 状态修改 */
	async statusEnroll() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			status: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.statusEnroll(input.id, input.status);
	}

	/** 列表 */
	async getAdminEnrollList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			whereEx: 'object|name=附加查询条件',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let adminService = new AdminEnrollService();
		let result = await adminService.getAdminEnrollList(input);

		let service = new EnrollService();

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].statusDesc = service.getJoinStatusDesc(list[k]);
			
			list[k].ENROLL_ADD_TIME = timeUtil.timestamp2Time(list[k].ENROLL_ADD_TIME, 'Y-M-D h:m:s');
			list[k].ENROLL_START = timeUtil.timestamp2Time(list[k].ENROLL_START, 'Y-M-D h:m');
			list[k].ENROLL_END = timeUtil.timestamp2Time(list[k].ENROLL_END, 'Y-M-D h:m');
		
			if (list[k].ENROLL_OBJ && list[k].ENROLL_OBJ.desc)
				delete list[k].ENROLL_OBJ.desc;

		}
		result.list = list;

		return result;

	}

	/** 发布 */
	async insertEnroll() {
		await this.isAdmin();

		// 数据校验 
		let rules = {
			title: 'must|string|min:2|max:50|name=标题',
			cateId: 'must|string|name=分类',
			cateName: 'must|string|name=分类名称',
			order: 'must|int|min:0|max:9999|name=排序号',

			maxCnt: 'must|int|name=人数上限',
			start: 'must|string|name=开始时间',
			end: 'must|string|name=截止时间',

			checkSet: 'must|int|name=审核设置',
			cancelSet: 'must|int|name=取消设置',
			editSet: 'must|int|name=修改设置',

			forms: 'array|name=表单',

			joinForms: 'must|array|name=用户填写资料设置',
		};


		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminEnrollService();
		let result = await service.insertEnroll(input);

		this.logOther('添加了《' + input.title + '》');

		return result;

	}

	/** 获取信息用于编辑修改 */
	async getEnrollDetail() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let enroll = await service.getEnrollDetail(input.id);
		if (enroll) {
			enroll.ENROLL_START = timeUtil.timestamp2Time(enroll.ENROLL_START, 'Y-M-D h:m');
			enroll.ENROLL_END = timeUtil.timestamp2Time(enroll.ENROLL_END, 'Y-M-D h:m');
		}

		return enroll;

	}

	/** 编辑 */
	async editEnroll() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			title: 'must|string|min:2|max:50|name=标题',
			cateId: 'must|string|name=分类',
			cateName: 'must|string|name=分类名称',

			maxCnt: 'must|int|name=人数上限',
			start: 'must|string|name=开始时间',
			end: 'must|string|name=截止时间',

			checkSet: 'must|int|name=审核设置',
			cancelSet: 'must|int|name=取消设置',
			editSet: 'must|int|name=修改设置',

			order: 'must|int|min:0|max:9999|name=排序号',
			forms: 'array|name=表单',

			joinForms: 'must|array|name=用户填写资料设置',
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminEnrollService();
		let result = service.editEnroll(input);

		this.logOther('修改了《' + input.title + '》');

		return result;
	}

	async clearEnrollAll() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id', 
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.clearEnrollAll(input.id);
	}

	/** 删除 */
	async delEnroll() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let title = await EnrollModel.getOneField(input.id, 'ENROLL_TITLE');

		let service = new AdminEnrollService();
		await service.delEnroll(input.id);

		if (title)
			this.logOther('删除了《' + title + '》');

	}

	/** 更新图片信息 */
	async updateEnrollForms() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			hasImageForms: 'array'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminEnrollService();
		return await service.updateEnrollForms(input);
	}

	//########################## 名单
	/** 预约名单列表 */
	async getEnrollJoinList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			enrollId: 'must|id',
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let result = await service.getEnrollJoinList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].ENROLL_JOIN_ADD_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_ADD_TIME);

		}
		result.list = list;

		return result;

	}

	/** 报名状态修改 */
	async statusEnrollJoin() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			enrollJoinId: 'must|id',
			status: 'must|int|in:0,1,8,9,10,98,99',
			reason: 'string|max:200',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.statusEnrollJoin(input.enrollJoinId, input.status, input.reason);
	}

	// 取消所有报名记录
	async cancelEnrollJoinAll() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			enrollId: 'must|id',
			reason: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.cancelEnrollJoinAll(input.enrollId, input.reason);
	}

	/** 报名删除 */
	async delEnrollJoin() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			enrollJoinId: 'must|id'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.delEnrollJoin(input.enrollJoinId);
	}

	/**************登记数据导出 BEGIN ********************* */
	/** 当前是否有导出文件生成 */
	async enrollJoinDataGet() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			isDel: 'int|must', //是否删除已有记录
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();

		if (input.isDel === 1)
			await service.deleteEnrollJoinDataExcel(); //先删除

		return await service.getEnrollJoinDataURL();
	}

	/** 导出数据 */
	async enrollJoinDataExport() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			enrollId: 'id|must',
			status: 'int|must|default=1'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.exportEnrollJoinDataExcel(input);
	}

	/** 删除导出的登记数据文件 */
	async enrollJoinDataDel() {
		await this.isAdmin();

		// 数据校验
		let rules = {};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.deleteEnrollJoinDataExcel();
	}

}

module.exports = AdminEnrollController;