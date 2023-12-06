//*设定submitfill()函数

async function submitfill() {

  let token = document.getElementById("data_token").value;

  let data = {
    name: document.getElementById("data_name").value,
    date: document.getElementById("data_date").value,
    position: document.getElementById("data_position").value,
    phone: document.getElementById("data_phone").value,
    status: document.getElementById("data_status").value,
    email: document.getElementById("data_email").value
  };

  let obj = {
    user: data.name,
    msg: "upload filled info",
    data: data
  };


  //submit update data


  const res = await fetch(`/employee/fill/?token=000000` + token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  }).catch(err => alert(err));

  let result = await res.json();
  console.log(result);
  alert(result.msg);
}


