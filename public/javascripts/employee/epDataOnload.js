/*
 *从服务器端获取数据,并填入myTable
 *点击submit,添加数据
 */


var table = document.getElementById("myTable");
let headerlinks = document.querySelectorAll('.headerlink');

//add click event to headerlinks
headerlinks[0].href = "/admin";
headerlinks[1].href = "/work-schedule";



//!set refresh()开始
async function refresh() {

  //get db from server
  let db = await fetch(`/employee/tabledata`, {
    headers: {
      'Content-Type': 'application/json'
    },
  }).catch(err => console.log(err))
  db = await db.json()

  //clear table
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
  // console.log(db);

  //count 带remarks的行数
  let count = 0;

  //fill table
  for (let i = 0; i < db.length; i++) {
    let row = table.insertRow(i + 1+count);
    let keys = Object.keys(db[i]);

    for (let j = 0; j < keys.length - 3; j++) {
      let cell = row.insertCell(j);
      if (j == 0) {
        cell.outerHTML = `<th scope="row"><a class="modify" href="" id="` + db[i]._id + `" data-toggle="modal" data-target="#myModal">&#9998;</a>&nbsp;&nbsp;${i+1}</th>`;
      } else if (j == 1) {
        cell.innerHTML = db[i].name;
      } else if (j == 2) {
        cell.innerHTML = `<span>#</span>${db[i].number}`;
      } else if (j == 3) {
        cell.innerHTML = db[i].date.slice(0, 10);
      } else if (j == 4) {
        cell.innerHTML = db[i].position;
      } else if (j == 5) {
        cell.innerHTML = db[i].phone;
      } else if (j == 6) {
        cell.innerHTML = db[i].status;
      } 
    }
    //判断每条obj里的remarks是否有值
    if (db[i].remarks) {
      //remarks行数+1
      count++;
      //如果有值,添加remarks为单独一行,并且偏移插入的行数
      let row2 = table.insertRow(i + 1+count);
      //remarks插入到新行
      let cell2 = row2.insertCell(0);
      cell2.outerHTML = `<td colspan = "7" class= "remarksRow" data-forid="${db[i]._id}">${db[i].remarks}</td>`;
    }

  }
  //更新字段点击监听
  addClickEvent();
}
//!refresh() 结束
//carry out refresh() 
refresh();



//点击submit,添加数据
let submit = document.getElementById("submit");
submit.addEventListener("click", function (event) {
  let data = [];
  let obj = {
    name: document.getElementById("name").value,
    number: '',
    date: document.getElementById("date").value,
    position: document.getElementById("position").value,
    phone: document.getElementById("phone").value,
    status: "onJob"
  };
  data.push(obj);


  //set async function fetchData()
  async function fetchData() {
    try {

      const res = await fetch(`/employee/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).catch(err => {
        alert("添加失败,重新再试!注意数据格式!");
      });
      let temp = await res.json();
console.log('temp:',temp);
      if (!temp) {
        throw new Error("添加失败,重新再试!注意数据格式! ");

      }
      alert("添加成功");

      await refresh();

    } catch (err) {
      console.log(err);
      alert("添加失败,重新再试!\n注意数据格式!\n例如:电话号码有重复,名字超过12字符,电话不为10位数. ");
    }




  };
  //carry out fetchData()
  fetchData();

});