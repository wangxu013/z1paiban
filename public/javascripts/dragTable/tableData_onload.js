//#region 页面初始化

//* 加载按钮点击事件函数
function gopage1() {
  window.location.href = "/employee";
}
function gopage2() {
  window.location.href = "/work-schedule";
}

//* 初始化表头日期

//获取表头上两个span元素
let table_date = document.getElementById('table_date');
table_date.innerText = weektodate("mon", new Date().toLocaleDateString());
//获取table_date的下一个兄弟元素
let table_date_next = table_date.nextElementSibling;
table_date_next.innerText = weektodate("sun", table_date.innerText);

//* 初始化输入框日期

//获取输入框元素
var dateInput = document.getElementById('dateInput');

//设置初始日期为今天,规避世界时
var now = new Date().toLocaleDateString();
dateInput.valueAsDate = new Date(now);

//* 初始化设定 "上周" "下周" "返回现在" 按钮的function
function goUp() {
  //! 向上滚动一周
  var date = new Date(dateInput.value);
  date.setDate(date.getDate() - 7);
  dateInput.valueAsDate = date;
  dateInput.dispatchEvent(new Event('input')); // 手动触发input事件
}

function goDown() {
  //! 向下滚动一周
  var date = new Date(dateInput.value);
  date.setDate(date.getDate() + 7);
  dateInput.valueAsDate = date;
  dateInput.dispatchEvent(new Event('input')); // 手动触发input事件
}

function goNow() {
  //! 返回今天
  var date = new Date(new Date().toLocaleDateString());
  dateInput.valueAsDate = date;
  dateInput.dispatchEvent(new Event('input')); // 手动触发input事件
}


//#endregion
//----------------------------------------------------------------------

/*
 *定义一个异步函数:fill the "填表div"
 *填表的根据数据库返回的"整周的图表蓝图"
 *需要根据table里的日期,给主机发request,{date="日期"}
 */
//定义个urlTpr
let urlTpr = "/admin/tabledata?date=";
//从id="table_date"的元素中获取innerText,并赋值给date
let date = table_date.innerText;



//^ run 初始化
//*先加载拖块div,再加载table data



async function dragblock_then_tableData(date) {
  //加载侧边拖块
  await dragblock_onload();
  //清除表格内容
  clearTable();
  //加载table该date的上班人员数据
  await tableData_onload(date);
}

//执行 dragblock_then_tableData(date)
dragblock_then_tableData(date);

//$ run 初始化

//^ run 页面改变,更新
/*
*页面选择的日期改变,fresh页面
*/

//^ 监听输入框的input事件; 输入框的值的改变时刷新页面
//*监听输入框的input事件
document.getElementById('dateInput').addEventListener('input', function () {
  // console.log('输入框的值已经改变，新的值是：' + this.value);

  //?更新表头上的日期

  let date = this.value;
  let result = date.trim().split("-")[1] + '/' + date.trim().split("-")[2] + '/' + date.trim().split("-")[0];
  // alert(new Date(this.value).toLocaleDateString());
  // alert("输入框的值已经改变，新的值是：" + this.value=='2023-12-26');

  table_date.innerText = weektodate("mon", result);
  //修改table_date_next的innerHTML
  table_date_next.innerHTML = weektodate("sun", table_date.innerText);

  //?刷新页面
  //清除tableCell原有数据
  clearTable();
  tableData_onload(result);
});//$ 监听输入框的input事件; 输入框的值的改变时刷新页面

//$ run 页面改变,更新

//^ 模态对话框设置
/*
 *选择日期,插入该日期的数据到表格中,从而修改当周表格的内容
 */
// 获取模态对话框元素
var modal = document.getElementById("myModal");

// 获取按钮元素
var btnChange = document.getElementById("btnChange");

// 获取 <span> 元素，用于关闭模态对话框
var span = document.getElementsByClassName("close")[0];

//! 点击按钮 "插入本周数据" 时，打开模态对话框
btnChange.onclick = function () {
  modal.style.display = "block";
};

//! 点击 <span> (x)，关闭模态对话框
span.onclick = function () {
  modal.style.display = "none";
};

//! 在用户点击其他地方时，关闭模态对话框
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

//! 初始化设定按钮 "确认插入日期"
async function confirmDate() {
  var date = await document.getElementById("datePicker").value;
  // console.log("选择的日期是：" + date);
  // 在这里，你可以将日期发送到后台
  modal.style.display = "none";
  //刷新页面
  //先清楚tableCell原有数据
  clearTable();
  //再重新填充tableCell数据
  await tableData_onload(date);
}
//$ 模态对话框设置



//------------------------------------------------------------------------
//#region 定义功能模块
//^ 加载侧边拖块; 定义dragblock_onload()
/**加载侧边的拖块div元素 */async function dragblock_onload() {
  //发送fetch 请求到 服务器,得到 employee数据ep_db
  let ep_db_t = await fetch('/admin/getemployeedb').catch(err => { console.log("fetch得到ep db err:" + err); });
  let ep_db = await ep_db_t.json();
  // console.log("ep_db:", ep_db);

  //获得left元素,共3个,父1个,子2个
  let left = document.querySelectorAll(".left");

  //清楚left的内容
  left[1].innerHTML = "";
  left[2].innerHTML = "";

  //定义变量add用于存放拼接的内容
  let add1 = '';
  let add2 = '';

  //将db写入add
  for (let i = 0; i < ep_db.length; i++) {
    //如果是onJob,则加入add1
    if (ep_db[i].status == "onJob") {
      add1 += `<div data-effect="copy" draggable="true" class="color${i + 1} item" data-idnum="${ep_db[i].number}">${ep_db[i].name}</div>`;
      //如果不是,则加入add2
    } else {
      add2 += `<div data-effect="copy" draggable="true" class="color${i + 1} item" data-idnum="${ep_db[i].number}">${ep_db[i].name}</div>`;
    }
  }


  //将add写入
  left[1].innerHTML = add1;
  left[2].innerHTML = add2;
}//$ 加载侧边拖块,定义dragblock_onload()

//^ 获取"填表蓝图"; 定义异步函数,参数("要求的日期","主机url")
/**从服务器请求date对应的"填表蓝图" 
 * @date -某周数据,其某周其中的一天日期
 * @url -请求的url路径"固定的部分" */
async function tableData_onload(date, url = urlTpr) {
  //?获取可拖拽的 "填表div" 的集合数据
  let tableDivs = document.querySelectorAll('div.left>div');
  let divClassNameMap = new Map();
  for (let v of tableDivs) {
    //获取class属性值
    var newStr = v.className;
    divClassNameMap.set(v.dataset.idnum, newStr);

  }

  //?获取所有的带有data-dropif属性的td元素
  let tableCell = document.querySelectorAll('td[data-dropif]');

  //!request "填表蓝图"
  let tableBlueprint = await fetch(url + `${date}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()).catch(err => console.log(err));

  // console.log(tableBlueprint);

  //!according "填表蓝图" to fill the "填表div"
  /*
  将td元素中的data-time属性值和tableBlueprint中的time属性值进行比较,如果相同,则根据tableBlueprint相应的idnum值,去divClassNameMap查找对应的键值,并且把divClassNameMap找的键值添加到td元素的innerHTML中
  */

  for (let e of tableCell) {
    for (let b of tableBlueprint) {
      if (e.dataset.time == b.time && e.dataset.pos == b.pos) {
        let divClassName = divClassNameMap.get(b.idnum);
        if (divClassName) {
          //modify the "填表div" of the td element
          e.innerHTML += `<div data-effect="move" draggable="true" class="${divClassName}" data-idnum="${b.idnum}">${b.name}</div>`;
        } else {
          e.innerHTML += `<div data-effect="move" draggable="true" class="item" data-idnum="${b.idnum}">${b.name}</div>`;
        }
      }
    }
  }

}//$ 获取"填表蓝图"; 定义异步函数,参数("要求的日期","主机url")

//^ 定义清表函数clearTable()
/**清理含[data-dropif]属性的cell */
function clearTable() {
  let tableCell = document.querySelectorAll('td[data-dropif]');
  for (let e of tableCell) {
    e.innerHTML = "";
  };
}//$ 定义清表函数clearTable()


//#endregion 

