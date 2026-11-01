/* 教材数据：北师大版小学数学（2024 年审定）。四年级上下册为已实现内容，其余年级仅占位。 */
(function (global) {
  'use strict';
  var MG = global.MG;

  function t(id, name) {
    return { id: id, name: name, gen: id };
  }

  MG.data.curriculum = {
    version: 2,
    edition: '北师大版',
    grades: [
      { id: 'g1', name: '一年级', status: 'todo', semesters: [] },
      { id: 'g2', name: '二年级', status: 'todo', semesters: [] },
      { id: 'g3', name: '三年级', status: 'todo', semesters: [] },
      {
        id: 'g4',
        name: '四年级',
        status: 'ready',
        semesters: [
          {
            id: 'g4a',
            name: '上册',
            units: [
              {
                id: 'g4a-u1', name: '认识更大的数', order: 1, hasGraphics: false,
                topics: [
                  t('g4a.u1.table', '十进制数位顺序表'),
                  t('g4a.u1.read', '大数的读法'),
                  t('g4a.u1.write', '大数的写法'),
                  t('g4a.u1.compare', '大数的大小比较'),
                  t('g4a.u1.convert', '改写成以"万""亿"为单位的数'),
                  t('g4a.u1.round', '近似数（四舍五入）'),
                  t('g4a.u1.code', '编码（综合实践）')
                ]
              },
              {
                id: 'g4a-u2', name: '线与角', order: 2, hasGraphics: true,
                topics: [
                  t('g4a.u2.line', '线段、射线与直线'),
                  t('g4a.u2.vertical', '相交与垂直'),
                  t('g4a.u2.parallel', '平移与平行'),
                  t('g4a.u2.classify', '角的分类'),
                  t('g4a.u2.protractor', '角的度量'),
                  t('g4a.u2.draw', '画角')
                ]
              },
              {
                id: 'g4a-u3', name: '整数乘法（二）', order: 3, hasGraphics: false,
                topics: [
                  t('g4a.u3.zero', '整十整百数的乘法'),
                  t('g4a.u3.mul2', '两位数乘两位数'),
                  t('g4a.u3.mul3', '三位数乘两位数'),
                  t('g4a.u3.est', '乘法的估算'),
                  t('g4a.u3.rule', '有趣的算式')
                ]
              },
              {
                id: 'g4a-u4', name: '我们生活的空间（二）', order: 4, hasGraphics: false,
                topics: [
                  t('g4a.u4.range', '观察的范围'),
                  t('g4a.u4.view', '从不同位置观察')
                ]
              },
              {
                id: 'g4a-u5', name: '运算律', order: 5, hasGraphics: false,
                topics: [
                  t('g4a.u5.order', '混合运算顺序'),
                  t('g4a.u5.bracket', '中括号'),
                  t('g4a.u5.add', '加法交换律和结合律'),
                  t('g4a.u5.sub', '减法性质'),
                  t('g4a.u5.mul', '乘法交换律和结合律'),
                  t('g4a.u5.dist', '乘法分配律'),
                  t('g4a.u5.simplify', '简便计算'),
                  t('g4a.u5.count', '数图形的学问')
                ]
              },
              {
                id: 'g4a-u6', name: '图形的奥秘', order: 6, hasGraphics: true,
                topics: [
                  t('g4a.u6.slice', '切开立体图形'),
                  t('g4a.u6.blocks', '搭建立体大楼'),
                  t('g4a.u6.roll', '翻滚正方体')
                ]
              },
              {
                id: 'g4a-u7', name: '运用数量关系解决问题', order: 7, hasGraphics: false,
                topics: [
                  t('g4a.u7.total', '总量与分量'),
                  t('g4a.u7.price', '单价、数量与总价'),
                  t('g4a.u7.speed', '速度、时间与路程'),
                  t('g4a.u7.meet', '相遇问题')
                ]
              },
              {
                id: 'g4a-u8', name: '数据的表示和分析（一）', order: 8, hasGraphics: true,
                topics: [
                  t('g4a.u8.read', '读条形统计图'),
                  t('g4a.u8.compare', '统计图中的比较'),
                  t('g4a.u8.scale', '1格表示多少'),
                  t('g4a.u8.group', '数据的分段整理')
                ]
              }
            ]
          },
          {
            id: 'g4b',
            name: '下册',
            units: [
              {
                id: 'g4b-u1', name: '小数的意义和加减法', order: 1, hasGraphics: false,
                topics: [
                  t('g4b.u1.meaning', '小数的意义'),
                  t('g4b.u1.unit', '小数与单位换算'),
                  t('g4b.u1.zero', '小数的性质'),
                  t('g4b.u1.compare', '小数的大小比较'),
                  t('g4b.u1.calc', '小数加减法'),
                  t('g4b.u1.mix', '小数加减混合运算')
                ]
              },
              {
                id: 'g4b-u2', name: '认识三角形和四边形', order: 2, hasGraphics: false,
                topics: [
                  t('g4b.u2.classify', '三角形的分类'),
                  t('g4b.u2.sum', '三角形的内角和'),
                  t('g4b.u2.side', '三角形三边关系'),
                  t('g4b.u2.quad', '四边形的分类'),
                  t('g4b.u2.stable', '图形的稳定性')
                ]
              },
              {
                id: 'g4b-u3', name: '小数乘法', order: 3, hasGraphics: false,
                topics: [
                  t('g4b.u3.int', '小数乘整数'),
                  t('g4b.u3.point', '小数点移动'),
                  t('g4b.u3.dec', '小数乘小数'),
                  t('g4b.u3.simplify', '小数乘法简算')
                ]
              },
              {
                id: 'g4b-u4', name: '观察物体', order: 4, hasGraphics: true,
                topics: [
                  t('g4b.u4.view', '从不同方向观察'),
                  t('g4b.u4.count', '数小正方体的个数')
                ]
              },
              {
                id: 'g4b-u5', name: '认识方程', order: 5, hasGraphics: false,
                topics: [
                  t('g4b.u5.letter', '字母表示数'),
                  t('g4b.u5.relation', '等量关系'),
                  t('g4b.u5.equation', '认识方程'),
                  t('g4b.u5.solve1', '解方程（加减型）'),
                  t('g4b.u5.solve2', '解方程（乘除型）'),
                  t('g4b.u5.word', '列方程解决问题'),
                  t('g4b.u5.tess', '密铺（数学好玩）')
                ]
              },
              {
                id: 'g4b-u6', name: '数据的表示和分析', order: 6, hasGraphics: true,
                topics: [
                  t('g4b.u6.bar', '读条形统计图'),
                  t('g4b.u6.line', '读折线统计图'),
                  t('g4b.u6.mean', '求平均数')
                ]
              }
            ]
          }
        ]
      },
      { id: 'g5', name: '五年级', status: 'todo', semesters: [] },
      { id: 'g6', name: '六年级', status: 'todo', semesters: [] }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
