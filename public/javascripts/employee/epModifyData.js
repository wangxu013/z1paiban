/*
 *点击submit按钮后提交数据
 *数据格式为
 * 
 */
//给字段值提取定义好变量容器
  let id, name_tpr, number, position, date, phone, status_tpr,remarks; //name和status有重名,加_tpr避免重复

//给字段添加点击事件监听
function addClickEvent() {
  
  // 在点击链接时，将链接的文本设置为输入元素的值
  let links = document.querySelectorAll(".modify");
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      //获取id字段的值
      id = this.id;
      
      //从主表中获取其余各个字段的值
      let elements = this.parentNode.parentNode.querySelectorAll(':scope > *');
      name_tpr = elements[1].innerText;
      number = elements[2].innerText.substring(1); //number去掉第一个字符
      date = elements[3].innerText;
      position = elements[4].innerText;
      phone = elements[5].innerText;
      status_tpr = elements[6].innerText;
      let remarksElem = document.querySelector(`[data-forid = '${id}']`)
      //三元计算判断remarksElem是否为null
      remarks = remarksElem ? remarksElem.innerText : "";

      //给弹窗中的字段填写和主表一样的值
      document.getElementById("data_name").value = name_tpr;
      document.getElementById("data_number").value = number;
      document.getElementById("data_date").value = date;
      document.getElementById("data_position").value = position;
      document.getElementById("data_phone").value = phone;
      document.getElementById("data_status").value = status_tpr;
      document.getElementById("data_remarks").value = remarks;
    });
  });
}


// 提交修改数据
async function submitupdate() {
  let dataArr = [];
  dataArr.push({
    _id:id,
   name: name_tpr,
    number,
    date,
    position: document.getElementById("data_position").value,
    phone: document.getElementById("data_phone").value,
    status: document.getElementById("data_status").value,
    remarks: document.getElementById("data_remarks").value
  });
  console.log(dataArr);
  //submit update data
 
      try {
        const res = await fetch(`${serverNetAddress}/employee/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataArr)
        });
        
        //打印状态码
        // console.log(res.status);
        // console.log(res.json());
        if (!res.ok) {
          alert("修改失败,重新再试 ")
          throw new Error("Error");
        };
        //refresh table
        await refresh();
        alert("修改成功");
      } catch (err) {
        console.log(err);
        alert("修改失败,重新再试 ", err);
      }
}



//提交删除数据

async function submitdelete() {
  let dataArr = [];
  dataArr.push({
    _id:id
  });
  try {
    const res = await fetch(`${serverNetAddress}/employee/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataArr)
    });
    //打印状态码
    console.log(res.status);
    console.log(res.json());
    if (!res.ok) {
      throw new Error("Error");
    };
    //refresh table
    await refresh();
    alert("删除成功");
  } catch (err) {
    console.log(err);
    alert("删除失败,重新再试 ", err);
  }
}