/**
 * Notes: 登记模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-06-23 04:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const EnrollService = require('../service/enroll_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');

class EnrollController extends BaseProjectController {

	_getTimeShow(start, end) {
		let startDay = timeUtil.timestamp2Time(start, 'M月D日');
		let startTime = timeUtil.timestamp2Time(start, 'h:m');
		let week = timeUtil.week(timeUtil.timestamp2Time(start, 'Y-M-D'));
		week = '';
		
		if (end) {
			let endDay = timeUtil.timestamp2Time(end, 'M月D日');
			let endTime = timeUtil.timestamp2Time(end, 'h:m');

			if (startDay != endDay)
				return `${startDay} ${startTime} ${week}～${endDay} ${endTime}`;
			else
				return `${startDay} ${startTime}～${endTime} ${week}`;
		}
		else
			return `${startDay} ${startTime} ${week}`;
	}

	/** 列表 */
	async getEnrollList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let result = await service.getEnrollList(input);

		// 数据格式化
		let list = result.list;

		for (let k = 0; k < list.length; k++) {
			list[k].start = this._getTimeShow(list[k].ENROLL_START);
			list[k].end = this._getTimeShow(list[k].ENROLL_END);
			list[k].statusDesc = service.getJoinStatusDesc(list[k]);

			if (list[k].ENROLL_OBJ && list[k].ENROLL_OBJ.intro)
				delete list[k].ENROLL_OBJ.intro;
		}

		return result;

	}


	/** 浏览详细 */
	async viewEnroll() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let enroll = await service.viewEnroll(this._userId, input.id);

		if (enroll) {
			enroll.start = this._getTimeShow(enroll.ENROLL_START);
			enroll.end = this._getTimeShow(enroll.ENROLL_END);
			enroll.statusDesc = service.getJoinStatusDesc(enroll);
		}

		return enroll;
	}


	/** 我的登记登记列表 */
	async getMyEnrollJoinList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let result = await service.getMyEnrollJoinList(this._userId, input);

		// 数据格式化
		let list = result.list;


		for (let k = 0; k < list.length; k++) {

			list[k].ENROLL_JOIN_ADD_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_ADD_TIME, 'Y-M-D h:m');
			list[k].ENROLL_JOIN_LAST_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_LAST_TIME, 'Y-M-D h:m');
		}

		result.list = list;

		return result;

	}

	/** 我的登记详情 */
	async getMyEnrollJoinDetail() {
		// 数据校验
		let rules = {
			enrollJoinId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let enrollJoin = await service.getMyEnrollJoinDetail(this._userId, input.enrollJoinId);
		if (enrollJoin) {
			enrollJoin.ENROLL_JOIN_ADD_TIME = timeUtil.timestamp2Time(enrollJoin.ENROLL_JOIN_ADD_TIME);
			enrollJoin.ENROLL_JOIN_LAST_TIME = timeUtil.timestamp2Time(enrollJoin.ENROLL_JOIN_LAST_TIME);
		}
		return enrollJoin;

	}

	/**  登记前获取关键信息 */
	async detailForEnrollJoin() {
		// 数据校验
		let rules = {
			enrollId: 'must|id',
			enrollJoinId: 'id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let meet = await service.detailForEnrollJoin(this._userId, input.enrollId, input.enrollJoinId);

		if (meet) {
			// 显示转换  
		}

		return meet;
	}

	/** 登记提交 */
	async enrollJoin() {
		// 数据校验
		let rules = {
			enrollId: 'must|id',
			forms: 'must|array',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.enrollJoin(this._userId, input.enrollId, input.forms);
	}

	/** 登记修改提交 */
	async enrollJoinEdit() {
		// 数据校验
		let rules = {
			enrollId: 'must|id',
			enrollJoinId: 'must|id',
			forms: 'must|array',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.enrollJoinEdit(this._userId, input.enrollId, input.enrollJoinId, input.forms);
	}

	/** 登记取消*/
	async cancelMyEnrollJoin() {
		// 数据校验
		let rules = {
			enrollJoinId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.cancelMyEnrollJoin(this._userId, input.enrollJoinId);
	}
}

module.exports = EnrollController;