module.exports = { //gongyi公益培训
	PROJECT_COLOR: '#07716B',
	NAV_COLOR: '#ffffff',
	NAV_BG: '#07716B',


	// setup
	SETUP_CONTENT_ITEMS: [
		{ title: '关于我们', key: 'SETUP_CONTENT_ABOUT' },
	],

	// 用户
	USER_REG_CHECK: false,
	USER_FIELDS: [
		{ mark: 'sex', title: '性别', type: 'select', selectOptions: ['男', '女'], must: true },
		{ mark: 'birth', title: '生日', type: 'date', must: true },
		{ mark: 'address', title: '住址', type: 'text', must: false },
		{ mark: 'work', title: '工作单位', type: 'text', must: false },
	],

	NEWS_NAME: '资讯',
	NEWS_CATE: [
		{ id: 1, title: '公告通知', style: 'leftbig1' },
		{ id: 2, title: '课堂风采', style: 'flow' },

	],
	NEWS_FIELDS: [
	],


	ENROLL_NAME: '报名',
	ENROLL_CATE: [
		{ id: 1, title: '少儿培训' },
		{ id: 2, title: '青年培训' },
		{ id: 3, title: '老年培训' },
	],
	ENROLL_FIELDS: [
		{ mark: 'cover', title: '封面图片', type: 'image', len: 1, must: true },
		{ mark: 'album', title: '介绍图集', type: 'image', min: 1, max: 8, must: true },
		{ mark: 'desc', title: '简介', type: 'textarea', max: 300, must: true },
		{ mark: 'intro', title: '详细介绍', type: 'content', must: true },

	],
	ENROLL_JOIN_FIELDS: [
		{ mark: 'name', type: 'text', title: '姓名', must: true, max: 30, edit: false },
		{ mark: 'sex', title: '性别', type: 'select', selectOptions: ['男', '女'], must: true, edit: false },
		{ mark: 'birth', type: 'date', title: '出生日期', must: true, edit: true },
		{ mark: 'phone', type: 'mobile', title: '电话号码', must: true, edit: true },
		{ mark: 'address', type: 'textarea', title: '家庭住址', must: true },
	], 

}