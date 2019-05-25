require('dotenv').config()
var express = require('express');
var DataTable = require('./datatable').DataTable; 
var moment = require('moment')
moment.locale('zh-CN')

var Table_INFO = "maininfo"; var Info = new DataTable({resourceName:Table_INFO});
var Table_tSEND = "send"; var Send = new DataTable({ resourceName: Table_tSEND });
var Table_SIGN = "sign"; var Sign = new DataTable({ resourceName: Table_SIGN });
var Table_ZAN = "zan"; var Zan = new DataTable({ resourceName: Table_ZAN });
var Table_CODE = "code"; var Code = new DataTable({ resourceName: Table_CODE });
var Table_SLIDE = "slide";var Slide = new DataTable({resourceName:Table_SLIDE});

var app = express();

var _req,_res;
app.get('/api',(req,res)=>{
  res.status(200).send('hello world')
})

app.get('/', async (req, res, next) => {
  _req = req; _res = res
  var c = req.query.c
  var appid = req.query.appid
  var maininfo = await getMainInfo(appid)

  var flag = await appidCheck(appid)
  if(!flag){
    res.status(200).send(`{success: false, msg: "未检测到此小程序配置！"}`)
    return
  }

  switch(c){
    case "info":_res.status(200).send(await infoHandler(maininfo));break;
    case "send":_res.status(200).send(await sendHandler(maininfo));break;
    case "zan":_res.status(200).send(await zanHandler(maininfo));break;
    case "sign": _res.status(200).send(await signHandler(maininfo));break;
    default:_res.status(200).send(await infoHandler(maininfo));break;
  }
})


async function infoHandler(maininfo){ 
  var chatList = await getSendList()
  var zanList = await getZanList()
  var slideList = await getSlideList(maininfo)
  data = {
    mainInfo:maininfo,
    zanLog:zanList,
    zanNum:zanList.length,
    slideList:slideList,
    slideNum:slideList.length,
    chatList:chatList,
    chatNum:chatList.length,
    music_url:"http://img.qiaker.cn/o5kj0s.m4a"
  }
  return data
}
async function getMainInfo(appid){
  return await Info.fetch().then(res=>{
    var attr = res.map(item=>item.attributes)
    return attr.find(item=>item.appid === appid)
  })
}

async function sendHandler(maininfo){
  var m1 = moment().format('ll')
  var m2 = moment().format('LT')
  var success = false;
  var msg = "";
  await Send.save({
    appid:_req.query.appid,
    userid:maininfo.userid,
    nickname:_req.query.nickname,
    face:_req.query.face,
    words:_req.query.words,
    time: m1 + " " + m2.split(':')[0] + "时" +m2.split(':')[1] + "分"
  }).then(obj=>{success = true;msg = "留言发送成功！"}).catch(e=>{success = false;msg = e})
  
    var chatList = await getSendList()
    return {
      success: success,
      msg: msg,
      chatList: chatList,
      chatNum: chatList.length
    }
}
async function getSendList(){
  return Send.fetch().then(res=>{
    return res.map(item=>item.attributes)
  })
}

async function zanHandler(maininfo){
  var m1 = moment().format('ll')
  var m2 = moment().format('LT')
  var success = false;
  var msg = "";
  var zanList = await getZanList()
  var flag = zanList.some((item)=>{return item.userid === maininfo.userid})
  if(flag){
    return { success : false, msg : "您已送出祝福了！" }
  }

  var data = {
    userid:maininfo.userid,
    nickname:_req.query.nickname,
    face:_req.query.face,
    time: m1 + " " + m2.split(':')[0] + "时" +m2.split(':')[1] + "分"
  }
/*   console.log("saving zan:",data) */
  await Zan.save(data).then(obj=>{success = true;msg = "您已送出祝福了！"}).catch(e=>{success = false;msg = e})
  return {success:success,msg:msg}
}

async function getZanList(){
  return await Zan.fetch().then(res=>{
    return res.map(item=>item.attributes)
  })
}

async function signHandler(maininfo){
  var success = false;
  var msg = "";
  var data = {
    userid:maininfo.userid.toString(),
    appid:_req.query.appid,
    nickname:_req.query.nickname,
    face:_req.query.face,
    name:_req.query.name,
    tel:_req.query.tel,
    plan:_req.query.play,
    extra:_req.query.extra
  }
  await Sign.save(data).then(obj=>{
    success = true
    msg="留言发送成功！"
  }).catch(e=>{
    success = false
    msg = "服务器故障,发送失败" 
  })
  return {success:success,msg:msg}
}

async function getSignList(){
  return await Sign.fetch().then(res=>{
    return res.map(item=>item.attributes)
  })
}

async function getSlideList(maininfo){
  return await Slide.fetch().then(res=>{
    return res.map(item=>item.attributes).filter((item)=>{return item.userid === maininfo.userid})
  })
}

app.listen(process.env.LEANCLOUD_APP_PORT,()=>{
  console.log("server is listening on port:" + process.env.LEANCLOUD_APP_PORT)
});


async function appidCheck(id){
  return await Code.fetch().then(
    (res) => {
      var attr = res.map(iterm => iterm.attributes)
      var flag = attr.some((one)=>{return one.appid === id})
      if (id !== undefined && flag) {
        return true
      }else{
        return false
      }
    })
}
