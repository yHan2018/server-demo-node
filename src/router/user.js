const mysqlOperation = require('../utils/connectDataBase');
const PageIfo = require('../model/PageInfo');
const dbResultDeal = require('../utils/dbResultDeal');
const _Http = require('../model/http');

const queryById = function (id, operation) {
  const pool = mysqlOperation.createPool();
  // mysqlOperation.query(operation, connect, 'name', 'user');
  const pageInfo = new PageIfo(currentPage, pageSize);
  mysqlOperation.query(operation, pool, 'name', 'user', pageInfo, 'id = ' + id);
}

const query = function (operation, pageInfo = null, where = null) {
  const pool = mysqlOperation.createPool();
  // mysqlOperation.query(operation, connect, 'name', 'user');
  console.log(pageInfo);
  if (pageInfo) {
    const page = new PageIfo(pageInfo.currentPage, pageInfo.pageSize);
    mysqlOperation.query(operation, pool, '*', 'user', page, where);
  } else {
    mysqlOperation.query(operation, pool, '*', 'user', null, where);
  }
}

const isDeleteSuccess = function (re) {
  let send;
  console.log('de re',re);
  if (re) {
    send = new _Http.Http.httpResponse(_Http.Http.HttpStatus.success, null);
  } else {
    send = new _Http.Http.httpResponse(_Http.Http.HttpStatus.error, null);
  }
  this.res.send(send);
}

const deleteUser = function (operation, where) {
  const pool = mysqlOperation.createPool();
  mysqlOperation.deleteData(operation, pool, 'user', where);
}


// const queryById = function (id, operation, currentPage = 0, pageSize = 10) {
//   const connect = mysqlOperation.createConnection();
//   // mysqlOperation.query(operation, connect, 'name', 'user');
//   const pageInfo = new PageIfo(currentPage, pageSize);
//   mysqlOperation.query(operation, connect, 'name', 'user', pageInfo, 'id = ' + id);
// }

// const query = function(operation, currentPage = 0, pageSize = 10){
//   const connect = mysqlOperation.createConnection();
//   const pageInfo = new PageIfo(currentPage, pageSize);
//   mysqlOperation.query(operation, connect, '*', 'user', pageInfo);
// }

function show(result, isPage) {
  if (!result) {
    send = new _Http.Http.httpResponse(_Http.Http.HttpStatus.error, null, '查寻失败，请重试');
    return;
  }
  let send = null;
  if (isPage) {
    const dealRes = dbResultDeal(result)
    if (dealRes.data.length > 0) {
      send = new _Http.Http.httpResponse(_Http.Http.HttpStatus.success, dealRes);
    } else {
      send = new _Http.Http.httpResponse(_Http.Http.HttpStatus.error, null, '没有查寻到数据');
    }
  } else {
    if (result.length > 0) {
      send = new _Http.Http.httpResponse(_Http.Http.HttpStatus.success, result);
    } else {
      send = new _Http.Http.httpResponse(_Http.Http.HttpStatus.error, null, '没有查寻到数据');
    }
  }
  // console.log(send);
  this.res.send(send);
}

const router = function (app) {
  app.get('/api/user', function (req, res) {
    if ('id' in req.query) {
      query(show.bind({
        res
      }), null, 'id = ' + req.query.id);
    } else {
      if ('currentPage' in req.query && 'pageSize' in req.query) {
        query(show.bind({
          res
        }), {
          currentPage: req.query.currentPage,
          pageSize: req.query.pageSize
        });
      } else {
        query(show.bind({
          res
        }));
      }
    }
  });
  app.post('/api/user', function (req, res) {

  });

  app.delete('/api/user', function (req, res) {
    console.log('delete');
    if ('id' in req.query) {
      deleteUser(isDeleteSuccess.bind({
        res
      }), 'id = ' + req.query.id);
    } else {
      const re = new _Http.Http.httpResponse(_Http.Http.HttpStatus.error, null, '请传入用户Id');
      res.send(re);
    }
  });
}

module.exports = router;