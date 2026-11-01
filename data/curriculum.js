/* 教材数据：人教版小学数学。四年级上下册为已实现内容，其余年级仅占位。 */
(function (global) {
  'use strict';
  var MG = global.MG;

  function t(id, name) {
    return { id: id, name: name, gen: id };
  }

  MG.data.curriculum = {
    version: 1,
    edition: '人教版',
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
                id: 'g4a-u1', name: '大数的认识', order: 1, hasGraphics: false,
                topics: [
                  t('g4a.u1.read', '亿以内数的读法'),
                  t('g4a.u1.write', '亿以内数的写法'),
                  t('g4a.u1.compare', '数的大小比较'),
                  t('g4a.u1.round', '改写与近似数')
                ]
              },
              {
                id: 'g4a-u2', name: '公顷和平方千米', order: 2, hasGraphics: false,
                topics: [
                  t('g4a.u2.convert', '面积单位换算'),
                  t('g4a.u2.unit', '选择合适的面积单位')
                ]
              },
              {
                id: 'g4a-u3', name: '角的度量', order: 3, hasGraphics: true,
                topics: [
                  t('g4a.u3.classify', '角的分类'),
                  t('g4a.u3.sum', '角的度数计算'),
                  t('g4a.u3.protractor', '量角器读数')
                ]
              },
              {
                id: 'g4a-u4', name: '三位数乘两位数', order: 4, hasGraphics: false,
                topics: [
                  t('g4a.u4.mul', '三位数乘两位数笔算'),
                  t('g4a.u4.rule', '积的变化规律'),
                  t('g4a.u4.word', '单价与速度问题')
                ]
              },
              {
                id: 'g4a-u5', name: '平行四边形和梯形', order: 5, hasGraphics: false,
                topics: [
                  t('g4a.u5.parallel', '垂直与平行'),
                  t('g4a.u5.shape', '平行四边形与梯形')
                ]
              },
              {
                id: 'g4a-u6', name: '除数是两位数的除法', order: 6, hasGraphics: false,
                topics: [
                  t('g4a.u6.estimate', '除法的估算'),
                  t('g4a.u6.div', '除数是两位数的笔算'),
                  t('g4a.u6.rule', '商的变化规律')
                ]
              },
              {
                id: 'g4a-u7', name: '条形统计图', order: 7, hasGraphics: true,
                topics: [
                  t('g4a.u7.read', '读条形统计图'),
                  t('g4a.u7.compare', '统计图中的比较'),
                  t('g4a.u7.draw', '确定直条的高度')
                ]
              },
              {
                id: 'g4a-u8', name: '数学广角——优化', order: 8, hasGraphics: false,
                topics: [
                  t('g4a.u8.tea', '沏茶问题'),
                  t('g4a.u8.pancake', '烙饼问题'),
                  t('g4a.u8.horse', '田忌赛马')
                ]
              }
            ]
          },
          {
            id: 'g4b',
            name: '下册',
            units: [
              {
                id: 'g4b-u1', name: '四则运算', order: 1, hasGraphics: false,
                topics: [
                  t('g4b.u1.order', '运算顺序'),
                  t('g4b.u1.calc', '含括号的混合运算'),
                  t('g4b.u1.zero', '关于 0 的运算')
                ]
              },
              {
                id: 'g4b-u2', name: '观察物体（二）', order: 2, hasGraphics: true,
                topics: [
                  t('g4b.u2.view', '从不同方向观察'),
                  t('g4b.u2.count', '数小正方体的个数')
                ]
              },
              {
                id: 'g4b-u3', name: '运算定律', order: 3, hasGraphics: false,
                topics: [
                  t('g4b.u3.identify', '辨认运算定律'),
                  t('g4b.u3.simplify', '简便计算')
                ]
              },
              {
                id: 'g4b-u4', name: '小数的意义和性质', order: 4, hasGraphics: false,
                topics: [
                  t('g4b.u4.point', '小数点移动'),
                  t('g4b.u4.compare', '小数的大小比较与化简'),
                  t('g4b.u4.unit', '小数单位换算'),
                  t('g4b.u4.round', '小数的近似数')
                ]
              },
              {
                id: 'g4b-u5', name: '三角形', order: 5, hasGraphics: false,
                topics: [
                  t('g4b.u5.sum', '三角形的内角和'),
                  t('g4b.u5.side', '三边关系'),
                  t('g4b.u5.classify', '三角形的分类')
                ]
              },
              {
                id: 'g4b-u6', name: '小数的加法和减法', order: 6, hasGraphics: false,
                topics: [
                  t('g4b.u6.calc', '小数加减法笔算'),
                  t('g4b.u6.simplify', '小数加减简便计算')
                ]
              },
              {
                id: 'g4b-u7', name: '图形的运动（二）', order: 7, hasGraphics: true,
                topics: [
                  t('g4b.u7.symmetry', '轴对称图形'),
                  t('g4b.u7.translate', '平移')
                ]
              },
              {
                id: 'g4b-u8', name: '平均数与条形统计图', order: 8, hasGraphics: true,
                topics: [
                  t('g4b.u8.mean', '求平均数'),
                  t('g4b.u8.chart', '统计图中的平均数')
                ]
              },
              {
                id: 'g4b-u9', name: '数学广角——鸡兔同笼', order: 9, hasGraphics: false,
                topics: [
                  t('g4b.u9.chicken', '鸡兔同笼')
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
