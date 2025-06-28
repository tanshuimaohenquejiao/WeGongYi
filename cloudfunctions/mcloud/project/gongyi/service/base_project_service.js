/**
 * Notes: 业务基类 
 * Date: 2025-03-15 04:00:00 
 */

const dbUtil = require('../../../framework/database/db_util.js');
const util = require('../../../framework/utils/util.js');
const AdminModel = require('../../../framework/platform/model/admin_model.js');
const NewsModel = require('../model/news_model.js');
const EnrollModel = require('../model/enroll_model.js');
const BaseService = require('../../../framework/platform/service/base_service.js');

class BaseProjectService extends BaseService {
	getProjectId() {
		return util.getProjectId();
	}

	async initSetup() {
		let F = (c) => 'bx_' + c;
		const INSTALL_CL = 'setup_gongyi';
		const COLLECTIONS = ['setup', 'admin', 'log', 'news', 'enroll', 'enroll_join', 'fav', 'user'];
		const CONST_PIC = '/images/cover.gif';

		const NEWS_CATE = '1=公告通知,2=课堂风采';
		const ENROLL_CATE = '1=少儿培训,2=青年培训,3=老年培训';


		if (await dbUtil.isExistCollection(F(INSTALL_CL))) {
			return;
		}

		console.log('### initSetup...');

		let arr = COLLECTIONS;
		for (let k = 0; k < arr.length; k++) {
			if (!await dbUtil.isExistCollection(F(arr[k]))) {
				await dbUtil.createCollection(F(arr[k]));
			}
		}

		if (await dbUtil.isExistCollection(F('admin'))) {
			let adminCnt = await AdminModel.count({});
			if (adminCnt == 0) {
				let data = {};
				data.ADMIN_NAME = 'admin';
				data.ADMIN_PASSWORD = 'e10adc3949ba59abbe56e057f20f883e';
				data.ADMIN_DESC = '超管';
				data.ADMIN_TYPE = 1;
				await AdminModel.insert(data);
			}
		}


		if (await dbUtil.isExistCollection(F('news'))) {
			let newsCnt = await NewsModel.count({});
			if (newsCnt == 0) {
				let newsArr = NEWS_CATE.split(',');
				for (let j in newsArr) {
					let title = newsArr[j].split('=')[1];
					let cateId = newsArr[j].split('=')[0];

					let data = {};
					data.NEWS_TITLE = title + '标题1';
					data.NEWS_DESC = title + '简介1';
					data.NEWS_CATE_ID = cateId;
					data.NEWS_CATE_NAME = title;
					data.NEWS_CONTENT = [{ type: 'text', val: title + '内容1' }];
					data.NEWS_PIC = [CONST_PIC];

					await NewsModel.insert(data);
				}
			}
		}

		if (await dbUtil.isExistCollection(F('enroll'))) {
			let enrollCnt = await EnrollModel.count({});
			if (enrollCnt == 0) {
				let enrollArr = ENROLL_CATE.split(',');
				for (let j in enrollArr) {
					let title = enrollArr[j].split('=')[1];
					let cateId = enrollArr[j].split('=')[0];

					let data = {};
					data.ENROLL_TITLE = title + '1';
					data.ENROLL_CATE_ID = cateId;
					data.ENROLL_CATE_NAME = title;
					data.ENROLL_START = this._timestamp;
					data.ENROLL_END = this._timestamp + 86400 * 1000 * 30;
					data.ENROLL_OBJ = {
						cover: [CONST_PIC],
						desc: title + '1简介',
					};

					await EnrollModel.insert(data);
				}
			}
		}


		if (!await dbUtil.isExistCollection(F(INSTALL_CL))) {
			await dbUtil.createCollection(F(INSTALL_CL));
		}
	}

}

module.exports = BaseProjectService;