/**
 * Notes: 登记后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-06-23 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const EnrollService = require('../enroll_service.js');
const AdminHomeService = require('../admin/admin_home_service.js');
const util = require('../../../../framework/utils/util.js');
const EnrollModel = require('../../model/enroll_model.js');
const EnrollJoinModel = require('../../model/enroll_join_model.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const exportUtil = require('../../../../framework/utils/export_util.js');

// 导出登记数据KEY
const EXPORT_ENROLL_JOIN_DATA_KEY = 'EXPORT_ENROLL_JOIN_DATA';

class AdminEnrollService extends BaseProjectAdminService {

	/** 推荐首页SETUP */
	async vouchEnrollSetup(id, vouch) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/**取得分页列表 */
	async getAdminEnrollList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'ENROLL_ORDER': 'asc',
			'ENROLL_ADD_TIME': 'desc'
		};
		let fields = 'ENROLL_TITLE,ENROLL_CATE_ID,ENROLL_CATE_NAME,ENROLL_EDIT_TIME,ENROLL_ADD_TIME,ENROLL_ORDER,ENROLL_STATUS,ENROLL_VOUCH,ENROLL_JOIN_CNT,ENROLL_MAX_CNT,ENROLL_START,ENROLL_END,ENROLL_EDIT_SET,ENROLL_CANCEL_SET,ENROLL_CHECK_SET,ENROLL_QR,ENROLL_OBJ';

		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [{
				ENROLL_TITLE: ['like', search]
			},];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.ENROLL_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.ENROLL_STATUS = Number(sortVal);
					break;
				}
				case 'vouch': {
					where.and.ENROLL_VOUCH = 1;
					break;
				}
				case 'top': {
					where.and.ENROLL_ORDER = 0;
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'ENROLL_ADD_TIME');
					break;
				}
			}
		}

		return await EnrollModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**置顶与排序设定 */
	async sortEnroll(id, sort) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**首页设定 */
	async vouchEnroll(id, vouch) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**添加 */
	async insertEnroll({
		title,
		cateId,
		cateName,

		maxCnt,
		start,
		end,

		checkSet,
		cancelSet,
		editSet,

		order,
		forms,
		joinForms,
	}) {

		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**删除数据 */
	async delEnroll(id) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/**获取信息 */
	async getEnrollDetail(id) {
		let fields = '*';

		let where = {
			_id: id
		}

		let enroll = await EnrollModel.getOne(where, fields);
		if (!enroll) return null;

		return enroll;
	}

	// 更新forms信息
	async updateEnrollForms({
		id,
		hasImageForms
	}) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/**更新数据 */
	async editEnroll({
		id,
		title,
		cateId, // 二级分类 
		cateName,

		maxCnt,
		start,
		end,

		checkSet,
		cancelSet,
		editSet,

		order,
		forms,
		joinForms
	}) {

		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**修改状态 */
	async statusEnroll(id, status) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	//#############################
	/**登记分页列表 */
	async getEnrollJoinList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		enrollId,
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'ENROLL_JOIN_LAST_TIME': 'desc'
		};
		let fields = '*';

		let where = {
			ENROLL_JOIN_ENROLL_ID: enrollId
		};
		if (util.isDefined(search) && search) {
			where['ENROLL_JOIN_FORMS.val'] = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					where.ENROLL_JOIN_STATUS = Number(sortVal);
					break;
			}
		}

		return await EnrollJoinModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**修改登记状态 
	 */
	async statusEnrollJoin(enrollJoinId, status, reason = '') {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}


	/** 取消某项目所有记录 */
	async cancelEnrollJoinAll(enrollId, reason) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/** 清空 */
	async clearEnrollAll(enrollId) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/** 删除登记 */
	async delEnrollJoin(enrollJoinId) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	// #####################导出登记数据
	/**获取登记数据 */
	async getEnrollJoinDataURL() {
		return await exportUtil.getExportDataURL(EXPORT_ENROLL_JOIN_DATA_KEY);
	}

	/**删除登记数据 */
	async deleteEnrollJoinDataExcel() {
		return await exportUtil.deleteDataExcel(EXPORT_ENROLL_JOIN_DATA_KEY);
	}

	/**导出登记数据 */
	async exportEnrollJoinDataExcel({
		enrollId,
		status
	}) {
		this.AppError('该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

}

module.exports = AdminEnrollService;