const socket = io()

const sttNhietDo = document.getElementById("nhietdo")
const sttDoAm = document.getElementById("doAm")
const sttAnhSang = document.getElementById("anhSang")
const sttden = document.getElementById("den")
const sttdieuhoa = document.getElementById("dieuhoa")

  socket.on("temp",function(data_received){
      let nhietdo = data_received
      document.getElementById("temp_value").innerHTML = nhietdo + "°C"

      if(nhietdo <= 20){
        sttNhietDo.style.backgroundColor = "blue";
      }else if(nhietdo <= 30){
        sttNhietDo.style.backgroundColor = "orange";
      }else{
        sttNhietDo.style.backgroundColor = "red";
      }

      //thêm giá trị vào biểu đồ
      updatee.data.datasets[0].data.push(nhietdo)
      updatee.data.labels.push(new Date().getSeconds());
  })

  socket.on("humi",function(data_received){
    let doam = data_received
    document.getElementById("humi_value").innerHTML = doam + "%"
    
    if(doam <= 10){
      sttDoAm.style.backgroundColor = "lightcyan";
    }else if(doam <= 65){
      sttDoAm.style.backgroundColor = "lightblue";
    }else{
      sttDoAm.style.backgroundColor = "blue";
    }

    updatee.data.datasets[1].data.push(doam)
  })

  socket.on("light",function(data_received){
    let anhsang = data_received
    document.getElementById("light_value").innerHTML = anhsang +" lux"

    if(anhsang <= 10){
      sttAnhSang.style.backgroundColor = "lightcyan";
    }else if(anhsang <= 50){
      sttAnhSang.style.backgroundColor = "lightgoldenrodyellow";
      socket.emit("control_relay_1","1")
    }else{
      sttAnhSang.style.backgroundColor = "yellow";
    }

      updatee.data.datasets[2].data.push(anhsang)
      updatee.update()
      // if(updatee.data.labels.length > 5){
        updatee.data.labels.push(new Date().getSeconds());
        updatee.data.labels.shift()
      // }
  })



  // cập nhật chart 
  // function updateChart(){
  //   if(updatee.data.labels.length > 15){
  //     updatee.data.datasets[0].data.shift()
  //     updatee.data.datasets[1].data.shift()
  //     updatee.data.datasets[2].data.shift()
  //     updatee.data.labels.shift()
  //   }
  // }

  // updateChart()
  

//thiết lập chart ban đầu
const updatee = new Chart("myChart", {
  type: "line",
  data: {
    labels: [],
    datasets: [{
        label: "Nhiệt độ",
        lineTension: 0.3,
        backgroundColor: "red",      // màu các điểm
        borderColor: "red",         //màu đường kẻ
        data: []
      },{
        label: "Độ ẩm",
        lineTension: 0.3,
        backgroundColor: "blue",      
        borderColor: "blue",         
        data: []
      },{
        label: "Ánh sáng",              
        lineTension: 0.3,
        backgroundColor: "yellow",      
        borderColor: "yellow",         
        data: []
      }
    ]
  },
  options: {
    // legend: {
    //   display: false
    // },
    scales: {
      x: {
        title:{
          display: false,
          text: "TIME (s)"
        }
      }
    }
  }
})



//thiết lập công tắc đèn (toggle switch)
// sttden.style.backgroundColor = "DarkGray";
// sttdieuhoa.style.backgroundColor = "DarkGray";

socket.on("relay_1",function(data_received){
  if(data_received == 0){
    document.getElementById("checkboxThreeInput_den").checked =true
    document.getElementById("light_img").src='/public/images/on_light.png'
    sttden.style.backgroundColor = "yellow";
  } else{
    document.getElementById("checkboxThreeInput_den").checked = false
    document.getElementById("light_img").src='/public/images/off_light.png'
    sttden.style.backgroundColor = "DarkGray";
  }
})

socket.on("relay_2",function(data_received){
  if(data_received == 0){
    document.getElementById("checkboxThreeInput_tv").checked = true
    document.getElementById("tv_img").src='/public/images/on_tv.png'
    sttdieuhoa.style.backgroundColor = "PaleGreen";
  } else{
    document.getElementById("checkboxThreeInput_tv").checked = false
    document.getElementById("tv_img").src='/public/images/off_tv.png'
    sttdieuhoa.style.backgroundColor = "DarkGray";
  }
})




function kiemtra_on_off_den(){
  let trangthai = document.getElementById("checkboxThreeInput_den")
  if(trangthai.checked == true){      
    var result = confirm(" bạn có muốn bật đèn không ? ")
      if(result){
        socket.emit("control_relay_1","0")
      } else {
        trangthai.checked = false
      }
  }else{
    socket.emit("control_relay_1","1")
  }
}

function kiemtra_on_off_tv(){
  let trangthai1 = document.getElementById("checkboxThreeInput_tv")
  if(trangthai1.checked == true){
    var result1 = confirm(" bạn có muốn bật tivi không ? ")
    if(result1){
    socket.emit("control_relay_2","0")
    } else {
      trangthai1.checked = false
    }
  }else{
    socket.emit("control_relay_2","1")
    }
}

                                   
//nhấn nút để xem chart
function showChart(){
  document.getElementById("myChart").style.opacity = "1"
  document.getElementById("nut_nhan_chart").remove()
}

// let person = prompt("Tên của bạn là gì ?");
// if (person == null || person == " ") {
//   document.getElementById('chao_mung').innerHTML = "Chào mừng quý khách lần đầu sử dụng"
// } else {
//   document.getElementById('chao_mung').insertAdjacentHTML("beforeend", person)
// }
