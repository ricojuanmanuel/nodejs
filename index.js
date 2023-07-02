const http = require('http');
const puppeteer = require('puppeteer');
const MySql = require ('mysql');
const randomUserAgent = require ('random-useragent');
let contadorDB = 0;
const PORT = 3000;

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
async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}
const ApiCMC = async (funcion,index) =>{
  let indexado = parseInt(index) * 100;
  console.log(indexado)
  const header = randomUserAgent.getRandom();
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    timeout: 10000,
  }); //abrir el navegador
  const page = await browser.newPage(); //abrir una nueva pestaña
  await page.setUserAgent(header); // setear a esa pestaña el useragent
  await page.setViewport({width:1920,height:1080}); //definir la resolucion de navegacion
  await page.setCookie({
      'name': 'homepage_table_customize',
      'value': '%5B%22Market%20Cap%22%2C%22Volume(24h)%22%2C%22From%20ATH%22%2C%2224h%20Chart%22%2C%22ATH%22%5D',
      'path': '/',
      'domain':'coinmarketcap.com'
  })
  await page.goto(`https://coinmarketcap.com/?page=${index}`, {timeout: 0});//definir la pagina a visitar
  
      await autoScroll(page);
      let selectorPrincipal = 'table.cmc-table > tbody > tr > td:nth-child(5)';
      await page.waitForSelector(selectorPrincipal); //espera a que se cargue este selector
      const items = await page.$$('table.cmc-table > tbody > tr');
      let nombreImg = `fotoScreen${index}.png`
      //await page.screenshot({path:nombreImg}); //toma un screenshot
      let count = 0;
      let data = [];
      console.log(items)
      for (const content of items){
          console.log(count)
          count++;
          const fila = await content.$$("td");
          const id = await fila[1].$('p');
          const name = await fila[2].$('div p:first-child');
          const sufijo = await fila[2].$('div p:last-child');
          const logo = await fila[2].$('div > a > div > img');
          const precio = await fila[3].$('div > a > span');
          const volumen = await fila[7].$('p > span:last-child');
          //const grafica = await fila[10].$('a > img');
          const getID = await page.evaluate(name => name?.innerText,id);
          const getName = await page.evaluate(name => name?.innerText,name);
          const getSufijo = await page.evaluate(sufijo => sufijo?.innerText,sufijo);
          const getLogo = await page.evaluate(logo => logo.getAttribute('src'),logo);
          const getCurrentPrice = await page.evaluate(currentPrice => currentPrice?.innerText,precio);
          const getVolumen = await page.evaluate(volumen => volumen?.innerText,volumen);
          //const getGrafica= await page.evaluate(grafica => grafica.getAttribute('src'),grafica);
          data.push({
              id:getID,
              name:getName,
              sufijo:getSufijo,
              logo:getLogo,
              currentPrice:getCurrentPrice,
              volume24h:getVolumen,
              grafica:'getGrafica'
          }) 
          
      }
      console.log(data)
      await browser.close(); //cierra el navegador
      switch(funcion){
          case 'dbInsert':SaveOnMySql(data,'insertCMC');break;
          case 'dbUpdate':SaveOnMySql(data,'updateCMC');break;
          default: console.log(data);
      }  
}
async function ejecucion(){
  //let vuelta = []
  for(var x=1;x<2;x++){
      await ApiCMC('dbUpdateN',x);
  }
}
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!');
});
 

server.listen(PORT, () => {
  
  ejecucion();
  console.log(`Server running at http://localhost:${PORT}/`);
});
