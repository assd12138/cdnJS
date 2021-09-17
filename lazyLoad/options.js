const option1 = {
	tooltip: {
		trigger: 'axis',
	},
	legend: {
		data: ['单位净值走势'],
		right: '10%',
	},
	xAxis: {
		type: 'category',
	},
	dataZoom: [
		{
			// 这个dataZoom组件，默认控制x轴。
			type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
		},
		{
			// 缩放+滚轮
			type: 'inside',
		},
	],
	yAxis: {},

	series: [
		{
			datasetIndex: 0,
			name: '单位净值走势',
			type: 'line',
			encode: { x: 0, y: 1 },
		},
	],
}

const option2 = {
	tooltip: {
		trigger: 'axis',
	},
	legend: {
		data: ['本基金', '同类平均'],
		right: '10%',
	},
	xAxis: {
		type: 'category',
	},
	title: {
		text: '累计收益率走势'
	},
	dataZoom: [
		{
			// 这个dataZoom组件，默认控制x轴。
			type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
		},
		{
			// 缩放+滚轮
			type: 'inside',
		},
	],
	yAxis: {},

	series: [
		{
			datasetIndex: 1,
			name: '本基金',
			type: 'line',
			encode: { x: 0, y: 1 },
		},
		{
			datasetIndex: 0,
			name: '同类平均',
			type: 'line',
			encode: { x: 0, y: 1 },
		},
	],
}
