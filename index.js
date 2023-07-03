const http = require('http');
const MySql = require ('mysql');
let contadorDB = 0;
const PORT = 3000;
const axios = require('axios');
let data = [];
let updated = true;
const SaveOnMySql = async(functions,data=null) =>{
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
          console.log("Connected! insertCMC");
          for (const dato of data){
              contadorDB++;
              dato.name = dato.name.replaceAll('\'',"-")
              sql =`INSERT INTO tokens_v3 
              (rank_id,name,sufijo,current_price,volume_24h) 
              VALUES 
              ('${dato.id}','${dato.name}','${dato.sufijo}',${dato.currentPrice},${dato.volume24h});`;
              con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log("Result:0"+dato.contador+"--> " + dato.name + " <--- Ready");
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
              dato.name = dato.name.replaceAll('\'',"-")
              sql =`UPDATE tokens_v3 
              SET
              current_price=${dato.currentPrice} , volume_24h=${dato.volume24h}
              WHERE 
              name='${dato.name}' AND sufijo='${dato.sufijo}';`;
              con.query(sql, function (err, result) {
                  if (err) throw err;
                  const date = new Date();
                  console.log("Updated:0"+dato.contador+"--> " + dato.name + " <--- Ready");
                if(dato.contador == Object.keys(data).length) 
                {
                  updated = true
                }
                 
              });
          }
      });
  } else if(functions == 'time'){
   await con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
      sql =`INSERT INTO configs 
      (name,value)
      VALUES 
      ('last_updated','ok')`;
      con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("Result: Updated");
          updated=true
      });
    });
    return "Time Updated";
  } else if(functions == 'test'){
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
  }
}


const updateCMC= async(limit) => {
  //https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=1  
  //https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest  
  let contador = 0
  let responser = []
  const urlInsert1 = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?sort=market_cap&sort_dir=desc&limit="+limit
  const url = urlInsert1;
  await axios.get(url, {
      headers: {
        'X-CMC_PRO_API_KEY': 'd116334e-3353-4a67-825a-b78166fc79ec',
      },
    })
  .then((response)=>{
    
    responser  = response.data.data;
    //console.log("tamaño Response = "+responser.length)
  }).catch((ex)=>{
    console.log(ex);
  })
  //console.log("tamaño = "+responser.length)
  await responser.map((item)=>{
    contador++;
    console.log(item?.quote?.["USD"].market_cap);
    data.push({
      id:item?.id,
      name:item?.name,
      sufijo:item?.symbol,
      logo:null,
      currentPrice:item?.quote?.["USD"].price,
      volume24h:item?.quote?.["USD"].market_cap,
      grafica:null,
      contador:contador
    })
  })
  await SaveOnMySql('updateCMC',data)
  await SaveOnMySql('time')
  console.log("listo")
}

//select now() tiempo de la base de datos
//updateCMC();

const server = http.createServer(async(req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  if(updated){
    res.write('The tokens has been updated this take a few minutes.');
    updated=false
    updateCMC(100);
  } else {
    res.write('You need to wait for the previous task to finish.');
  }
  res.end('');
});

server.listen(PORT, () => {
  //ApiCMC();
  
  console.log(`Server running at http://localhost:${PORT}/`);
});
//select now()

