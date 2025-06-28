/**
 * Notes: 登记表格模块业务逻辑
 * Ver : CCMiniCloud Framework 3.2.11 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-07-04 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const ENROLL_NAME = '报名';
const EnrollModel = require('../model/enroll_model.js');
const EnrollJoinModel = require('../model/enroll_join_model.js');

class EnrollService extends BaseProjectService {

	// 获取当前登记状态
	getJoinStatusDesc(enroll) {
		let timestamp = this._timestamp;

		if (enroll.ENROLL_STATUS == 0)
			return '已停止';
		else if (enroll.ENROLL_START > timestamp)
			return '未开始';
		else if (enroll.ENROLL_END <= timestamp)
			return '已截止';
		else if (enroll.ENROLL_MAX_CNT > 0
			&& enroll.ENROLL_JOIN_CNT >= enroll.ENROLL_MAX_CNT)
			return '人数已满';
		else
			return '进行中';
	}

	/** 浏览信息 */
	async viewEnroll(userId, id) {

		let fields = '*';

		let where = {
			_id: id,
			ENROLL_STATUS: EnrollModel.STATUS.COMM
		}
		let enroll = await EnrollModel.getOne(where, fields);
		if (!enroll) return null;

		EnrollModel.inc(id, 'ENROLL_VIEW_CNT', 1);

		// 判断是否有登记
		let whereJoin = {
			ENROLL_JOIN_USER_ID: userId,
			ENROLL_JOIN_ENROLL_ID: id,
			ENROLL_JOIN_STATUS: ['in', [EnrollJoinModel.STATUS.WAIT, EnrollJoinModel.STATUS.SUCC]]
		}
		let enrollJoin = await EnrollJoinModel.getOne(whereJoin);
		if (enrollJoin) {
			enroll.myEnrollJoinId = enrollJoin._id;
			enroll.myEnrollJoinTag = (enrollJoin.ENROLL_JOIN_STATUS == EnrollJoinModel.STATUS.WAIT) ? '待审核' : '已填报';
		}
		else {
			enroll.myEnrollJoinId = '';
			enroll.myEnrollJoinTag = '';
		}

		return enroll;
	}


	/** 取得分页列表 */
	async getEnrollList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序 
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'ENROLL_ORDER': 'asc',
			'ENROLL_ADD_TIME': 'desc'
		};
		let fields = 'ENROLL_STOP,ENROLL_JOIN_CNT,ENROLL_OBJ,ENROLL_VIEW_CNT,ENROLL_TITLE,ENROLL_MAX_CNT,ENROLL_START,ENROLL_END,ENROLL_ORDER,ENROLL_STATUS,ENROLL_CATE_NAME,ENROLL_OBJ';

		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		where.and.ENROLL_STATUS = EnrollModel.STATUS.COMM; // 状态  

		if (util.isDefined(search) && search) {
			where.or = [{
				ENROLL_TITLE: ['like', search]
			},];
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					if (sortVal) where.and.ENROLL_CATE_ID = String(sortVal);
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

	/** 取得我的登记分页列表 */
	async getMyEnrollJoinList(userId, {
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序 
		page,
		size,
		isTotal = true,
		oldTotal
	}) {
		orderBy = orderBy || {
			'ENROLL_JOIN_ADD_TIME': 'desc'
		};
		let fields = 'ENROLL_JOIN_LAST_TIME,ENROLL_JOIN_REASON,ENROLL_JOIN_ENROLL_ID,ENROLL_JOIN_STATUS,ENROLL_JOIN_ADD_TIME,enroll.ENROLL_TITLE,enroll.ENROLL_EDIT_SET,enroll.ENROLL_CANCEL_SET';

		let where = {
			ENROLL_JOIN_USER_ID: userId
		};

		if (util.isDefined(search) && search) {
			where['enroll.ENROLL_TITLE'] = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType) {
			// 搜索菜单
			switch (sortType) {
				case 'timedesc': { //按时间倒序
					orderBy = {
						'ENROLL_JOIN_ADD_TIME': 'desc'
					};
					break;
				}
				case 'timeasc': { //按时间正序
					orderBy = {
						'ENROLL_JOIN_ADD_TIME': 'asc'
					};
					break;
				}
				case 'succ': {
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.SUCC;
					break;
				}
				case 'wait': {
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.WAIT;
					break;
				}
				case 'cancel': {
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.ADMIN_CANCEL;
					break;
				}
			}
		}

		let joinParams = {
			from: EnrollModel.CL,
			localField: 'ENROLL_JOIN_ENROLL_ID',
			foreignField: '_id',
			as: 'enroll',
		};

		let result = await EnrollJoinModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);

		return result;
	}

	/** 取得我的登记详情 */
	async getMyEnrollJoinDetail(userId, enrollJoinId) {

		let fields = '*';

		let where = {
			_id: enrollJoinId,
			ENROLL_JOIN_USER_ID: userId
		};
		let enrollJoin = await EnrollJoinModel.getOne(where, fields);
		if (enrollJoin) {
			enrollJoin.enroll = await EnrollModel.getOne(enrollJoin.ENROLL_JOIN_ENROLL_ID, 'ENROLL_TITLE');
		}
		return enrollJoin;
	}

	//################## 登记 
	// 登记 
	async enrollJoin(userId, enrollId, forms) {

		// 登记是否结束
		let whereEnroll = {
			_id: enrollId,
			ENROLL_STATUS: EnrollModel.STATUS.COMM
		}
		let enroll = await EnrollModel.getOne(whereEnroll);
		if (!enroll)
			this.AppError('该' + ENROLL_NAME + '不存在或者已经停止');

		// 是否登记开始
		if (enroll.ENROLL_START > this._timestamp)
			this.AppError('该' + ENROLL_NAME + '尚未开始');

		// 是否过了登记截止期
		if (enroll.ENROLL_END < this._timestamp)
			this.AppError('该' + ENROLL_NAME + '已经截止');


		// 人数是否满
		if (enroll.ENROLL_MAX_CNT > 0) {
			let whereCnt = {
				ENROLL_JOIN_ENROLL_ID: enrollId,
				ENROLL_JOIN_STATUS: ['in', [EnrollJoinModel.STATUS.WAIT, EnrollJoinModel.STATUS.SUCC]]
			}
			let cntJoin = await EnrollJoinModel.count(whereCnt);
			if (cntJoin >= enroll.ENROLL_MAX_CNT)
				this.AppError('该' + ENROLL_NAME + '人数已满');
		}

		// 自己是否已经有登记
		let whereMy = {
			ENROLL_JOIN_USER_ID: userId,
			ENROLL_JOIN_ENROLL_ID: enrollId,
			ENROLL_JOIN_STATUS: ['in', [EnrollJoinModel.STATUS.WAIT, EnrollJoinModel.STATUS.SUCC]]
		}
		let my = await EnrollJoinModel.getOne(whereMy);
		if (my) {
			if (my.ENROLL_JOIN_STATUS == EnrollJoinModel.STATUS.WAIT)
				this.AppError('您已经填报，正在等待审核，无须重复填报');
			else
				this.AppError('您已经填报成功，无须重复填报');
		}

		// 入库
		let data = {
			ENROLL_JOIN_USER_ID: userId,
			ENROLL_JOIN_ENROLL_ID: enrollId,
			ENROLL_JOIN_STATUS: (enroll.ENROLL_CHECK_SET == 0) ? EnrollJoinModel.STATUS.SUCC : EnrollJoinModel.STATUS.WAIT,
			ENROLL_JOIN_FORMS: forms
		}

		let enrollJoinId = await EnrollJoinModel.insert(data);

		// 统计数量
		this.statEnrollJoin(enrollId);

		let check = enroll.ENROLL_CHECK_SET;

		return { enrollJoinId, check }

	}


	// 修改登记 
	async enrollJoinEdit(userId, enrollId, enrollJoinId, forms) {
		let whereJoin = {
			_id: enrollJoinId,
			ENROLL_JOIN_USER_ID: userId,
			ENROLL_JOIN_ENROLL_ID: enrollId,
			ENROLL_JOIN_STATUS: ['in', [EnrollJoinModel.STATUS.WAIT, EnrollJoinModel.STATUS.SUCC]],
		}
		let enrollJoin = await EnrollJoinModel.getOne(whereJoin);
		if (!enrollJoin)
			this.AppError('该' + ENROLL_NAME + '记录不存在或者已经被系统取消');

		// 登记是否结束
		let whereEnroll = {
			_id: enrollId,
			ENROLL_STATUS: EnrollModel.STATUS.COMM
		}
		let enroll = await EnrollModel.getOne(whereEnroll);
		if (!enroll)
			this.AppError('该' + ENROLL_NAME + '不存在或者已经停止');


		if (enroll.ENROLL_EDIT_SET == 0)
			this.AppError('该' + ENROLL_NAME + '不允许修改资料');

		if (enroll.ENROLL_EDIT_SET == 2 && enroll.ENROLL_END < this._timestamp)
			this.AppError('该' + ENROLL_NAME + '已经截止，不能修改资料');

		if (enroll.ENROLL_EDIT_SET == 3
			&& enroll.ENROLL_CHECK_SET == 1
			&& enrollJoin.ENROLL_JOIN_STATUS == EnrollJoinModel.STATUS.SUCC
		)
			this.AppError('该' + ENROLL_NAME + '已通过审核，不能修改资料');


		let data = {
			ENROLL_JOIN_FORMS: forms,
			ENROLL_JOIN_LAST_TIME: this._timestamp,
		}
		await EnrollJoinModel.edit(whereJoin, data);

	}

	async statEnrollJoin(id) {
		let where = {
			ENROLL_JOIN_ENROLL_ID: id,
			ENROLL_JOIN_STATUS: ['in', [EnrollJoinModel.STATUS.WAIT, EnrollJoinModel.STATUS.SUCC]]
		}
		let cnt = await EnrollJoinModel.count(where);

		await EnrollModel.edit(id, { ENROLL_JOIN_CNT: cnt });
	}

	/**  登记前获取关键信息 */
	async detailForEnrollJoin(userId, enrollId, enrollJoinId = '') {
		let fields = 'ENROLL_JOIN_FORMS, ENROLL_TITLE';

		let where = {
			_id: enrollId,
			ENROLL_STATUS: EnrollModel.STATUS.COMM
		}
		let enroll = await EnrollModel.getOne(where, fields);
		if (!enroll)
			this.AppError('该' + ENROLL_NAME + '不存在');



		let joinMy = null;
		if (enrollJoinId) {
			// 编辑
			let whereMy = {
				ENROLL_JOIN_USER_ID: userId,
				_id: enrollJoinId
			}
			joinMy = await EnrollJoinModel.getOne(whereMy);
		}
		else {
			// 取出本人最近一次的填写表单 
			/*
			let whereMy = {
				ENROLL_JOIN_USER_ID: userId,
			}
			let orderByMy = {
				ENROLL_JOIN_ADD_TIME: 'desc'
			}
			joinMy = await EnrollJoinModel.getOne(whereMy, 'ENROLL_JOIN_FORMS', orderByMy);*/
		}

		let myForms = joinMy ? joinMy.ENROLL_JOIN_FORMS : [];
		enroll.myForms = myForms;
		return enroll;
	}

	/** 取消我的登记 只有成功和待审核可以取消 取消即为删除记录 */
	async cancelMyEnrollJoin(userId, enrollJoinId) {
		let where = {
			ENROLL_JOIN_USER_ID: userId,
			_id: enrollJoinId,
			ENROLL_JOIN_STATUS: ['in', [EnrollJoinModel.STATUS.WAIT, EnrollJoinModel.STATUS.SUCC]]
		};
		let enrollJoin = await EnrollJoinModel.getOne(where);

		if (!enrollJoin) {
			this.AppError('未找到可取消的记录');
		}

		let enroll = await EnrollModel.getOne(enrollJoin.ENROLL_JOIN_ENROLL_ID);
		if (!enroll)
			this.AppError('该' + ENROLL_NAME + '不存在');

		if (enroll.ENROLL_CANCEL_SET == 0)
			this.AppError('该' + ENROLL_NAME + '不能取消');


		if (enroll.ENROLL_CANCEL_SET == 2 && enroll.ENROLL_END < this._timestamp)
			this.AppError('该' + ENROLL_NAME + '已经截止，不能取消');

		if (enroll.ENROLL_CANCEL_SET == 3
			&& enroll.ENROLL_CHECK_SET == 1
			&& enrollJoin.ENROLL_JOIN_STATUS == EnrollJoinModel.STATUS.SUCC
		)
			this.AppError('该' + ENROLL_NAME + '已通过审核，不能取消');

		await EnrollJoinModel.del(where);

		this.statEnrollJoin(enrollJoin.ENROLL_JOIN_ENROLL_ID);

	}

}

module.exports = EnrollService;