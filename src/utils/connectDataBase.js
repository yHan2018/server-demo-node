const mysql = require('mysql');
const PageIfo = require('../model/PageInfo');
const dataBaseInfo = require('../config/config');

function createPool() {
  return mysql.createPool(dataBaseInfo);
}

/**
 * 创建一个数据库连接，该连接不能断开，断开后无法二次连接
 */
function createConnection() {
  return mysql.createConnection(dataBaseInfo);
}

const query = function (callback, pool, field, table, pageInfo = null, where = null) {
  let isPage = false;
  let sql;
  if (pageInfo) {
    if (pageInfo.currentPage <= 0 || !pageInfo.currentPage) pageInfo.currentPage = 1;
    var start = (pageInfo.currentPage - 1) * pageInfo.pageSize;
    var end = pageInfo.pageSize || 10;
    if (Object.getPrototypeOf(pageInfo) === PageIfo.prototype) {
      if (where) {
        sql = `select SQL_CALC_FOUND_ROWS ${field} from ${table} where ${where} limit ${start},${end};select FOUND_ROWS() as total;`;
      } else {
        sql = `select SQL_CALC_FOUND_ROWS ${field} from ${table} limit ${start},${end};select FOUND_ROWS() as total;`;
      }
    } else {
      console.error('"pageInfo" type error');
      return;
    }
    isPage = true;
  } else {
    if (where) {
      sql = `select ${field} from ${table} where ${where}`;
    } else {
      sql = `select ${field} from ${table}`;
    }
  }
  pool.getConnection(function (err, connection) {
    // Use the connection
    connection.query(sql, function (error, res) {
      // 使用完毕之后，将该连接释放回连接池
      connection.release();
      if (error) {
        console.error('查询失败', error);
        callback(null, isPage);
        return;
      }

      callback(res, isPage);
    });
  });
}

const deleteData = function (callback, pool, table, where = null) {
  const sql = `delete from ${table} where ${where}`;
  pool.getConnection(function (err, connection) {
    connection.query(sql, function (error, res) {
      // 使用完毕之后，将该连接释放回连接池
      connection.release();
      if (error) {
        console.error('查询失败', error);
        callback(null);
        return;
      } else {
        callback(res);
      }
    });
  });

}

// const query = function (callback, connection, field, table, pageInfo = null, where = null) {

//   if (pageInfo.currentPage <= 0 || !pageInfo.currentPage) pageInfo.currentPage = 1;
//   var start = (pageInfo.currentPage - 1) * pageInfo.pageSize;
//   var end = pageInfo.pageSize || 10;
//   let isPage = false;

//   let sql;
//   if (pageInfo) {
//     if (Object.getPrototypeOf(pageInfo) === PageIfo.prototype) {
//       if (where) {
//         sql = `select SQL_CALC_FOUND_ROWS ${field} from ${table} where ${where} limit ${start},${end};select FOUND_ROWS() as total;`;
//       } else {
//         sql = `select SQL_CALC_FOUND_ROWS ${field} from ${table} limit ${start},${end};select FOUND_ROWS() as total;`;
//       }
//     } else {
//       console.error('"pageInfo" type error');
//       return;
//     }
//     isPage = true;
//   } else {
//     if (where) {
//       sql = `select ${field} from ${table} where ${where}`;
//     } else {
//       sql = `select ${field} from ${table}`;
//     }
//   }

//   connection.query(sql, function (err, result) {
//     if (err) {
//       console.log('[SELECT ERROR] - ', err.message);
//       return;
//     }
//     callback(result, isPage);
//   });
// }

module.exports = {
  createPool,
  createConnection,
  query,
  deleteData
};