const http = require('http');
const MySql = require ('mysql');
let contadorDB = 0;
const PORT = 3000;
const axios = require('axios');
let data = [];
const SaveOnMySql = (data,functions) =>{
  let con = MySql.createConnection({
      host: "justhodl.io",
      user: "justhodl_athmywallet",
      password: "athmywallet-2023",
      database :"justhodl_athmywallet"
    });
  let sql ='';
  if (functions == 'insert'){
      con.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
          for (const dato of data){
              contadorDB++;
              let current = dato.currentPrice.replaceAll('$','');
              current = current.replaceAll(',','');
              let ath = dato.athPrice.replaceAll('$','');
              ath = ath.replaceAll(',','');
              let high = dato.toHigh.replaceAll('$','');
              high = high.replaceAll(',','');
              let drop = dato.dropAth.replaceAll('$','');
              drop = drop.replaceAll(',','');
              sql =`INSERT INTO tokens 
              (id,name,sufijo,logo,current_price,ath_price,high_porcent,drop_porcent,ath_date,volume_24h) 
              VALUES 
              ('${contadorDB}','${dato.name}','${dato.sufijo}','${dato.logo}','${current}','${ath}','${high}','${drop}','${dato.athDate}','${dato.volume24h}');`;
              con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log("Result: " + dato.id);
              });
      
          }
          
      });
  } else if (functions == 'insertCMC'){
      con.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
          for (const dato of data){
              contadorDB++;
              let current = dato.currentPrice.replaceAll('$','');
              current = current.replaceAll(',','');
              let volumen = dato.volume24h.replaceAll('$','');
              volumen = volumen.replaceAll(',','');
              sql =`INSERT INTO tokens_v2 
              (id,name,sufijo,logo,current_price,volume_24h) 
              VALUES 
              ('${dato.id}','${dato.name}','${dato.sufijo}','${dato.logo}','${current}','${volumen}');`;
              con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log("Result: " + dato.id);
              });
      
          }
          
      });
  } else if  (functions == 'updateATH'){
      con.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
          for (const dato of data){
              contadorDB++;
              let ath = dato.athPrice.replaceAll('$','');
              ath = ath.replaceAll(',','');
              let high = dato.toHigh.replaceAll('$','');
              high = high.replaceAll(',','');
              let drop = dato.dropAth.replaceAll('$','');
              drop = drop.replaceAll(',','');
              sql =`UPDATE tokens 
              SET
               ath_price='${ath}',high_porcent='${high}',drop_porcent='${drop}',ath_date='${dato.athDate}' 
              WHERE 
              name='${dato.name}' AND sufijo='${dato.sufijo}';`;
              con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log("Result: " + dato.id);
              });
          }
         
          
      });
  }  else if  (functions == 'updateATH2'){
      con.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
          for (const dato of data){
              contadorDB++;
              let ath = dato.athPrice.replaceAll('$','');
              ath = ath.replaceAll(',','');
              let high = dato.toHigh.replaceAll('$','');
              high = high.replaceAll(',','');
              let drop = dato.dropAth.replaceAll('$','');
              drop = drop.replaceAll(',','');
              sql =`UPDATE tokens_v2
              SET
               ath_price='${ath}',high_porcent='${high}',drop_porcent='${drop}',ath_date='${dato.athDate}' 
              WHERE 
               sufijo='${dato.sufijo}';`;
              con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log("Result: " + dato.id);
              });
          }
         
          
      });
  } else if  (functions == 'updateCMC'){
      con.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
          for (const dato of data){
              contadorDB++;
              let current = dato.currentPrice.replaceAll('$','');
              current = current.replaceAll(',','');
              let volumen = dato.volume24h.replaceAll('$','');
              volumen = volumen.replaceAll(',','');
              sql =`UPDATE tokens_v2 
              SET
              current_price='${current}', volume_24h='${volumen}', grafica_7d='${dato.grafica}'  
              WHERE 
              name='${dato.name}' AND sufijo='${dato.sufijo}';`;
              con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log("Result: " + dato.id);
              });
          }
         //con.destroy();
          
      });
  }
  //ACTUALIZAR RECUENTO DE TIEMPO
  con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
      for (const dato of data){
          sql =`UPDATE configs 
          SET
          value='0'  
          WHERE 
          name='last_updated'`;
          con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("Result: " + dato.id);
          });

      }
      
  });
}


const ApiCMC= async(funcion,cantidad) => {
  /*
  data.push({
    id:getID,
    name:getName,
    sufijo:getSufijo,
    logo:getLogo,
    currentPrice:getCurrentPrice,
    volume24h:getVolumen,
    grafica:'getGrafica'
  }) */
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50"
  const requuester = axios.get(url, {
      headers: {
        'X-CMC_PRO_API_KEY': 'd116334e-3353-4a67-825a-b78166fc79ec',
      },
    })
  .then((response)=>{
    const dataResponse  = response.data.data;
    dataResponse.map((item)=>{
      data.push({
        id:item?.id,
        name:item?.name,
        sufijo:item?.symbol,
        logo:null,
        currentPrice:item?.quote?.["USD"]?.price,
        volume24h:item?.quote?.["USD"]?.market_cap,
        grafica:null
      })
    })
    
  }).catch((ex)=>{
    console.log(ex);
  })
  switch(funcion){
    case 'dbInsert':SaveOnMySql(data,'insertCMC');break;
    case 'dbUpdate':SaveOnMySql(data,'updateCMC');break;
    default: return(JSON.stringify(data));
  }
}
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end('Hello World!');
  ApiCMC('',0);
});
 

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});


//https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=1  
//
/*
"logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
"id": 1,
"name": "Bitcoin",
"symbol": "BTC",
"slug": "bitcoin",
"description": "Bitcoin (BTC) is a consensus network that enables a new payment system and a completely digital currency. Powered by its users, it is a peer to peer payment network that requires no central authority to operate. On October 31st, 2008, an individual or group of individuals operating under the pseudonym "Satoshi Nakamoto" published the Bitcoin Whitepaper and described it as: "a purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution."",
"date_added": "2013-04-28T00:00:00.000Z",
"date_launched": "2013-04-28T00:00:00.000Z"
*/

//https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest  