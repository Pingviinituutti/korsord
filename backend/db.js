"use strict";
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./app.db", (err) => {
  if (err) {
    console.error(err.message);
    process.exit();
  }
  console.log("Connected to the SQlite database.");
});

exports.closeDB = () => {
  return new Promise((resolve, _) => {
    db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Closed the database connection.");
      }

      resolve();
    });
  });
};

db.serialize(() => {
  db.run(
    "create table if not exists eventTypes(" +
      "typeId integer primary key," +
      "type text unique not null" +
      ");",
    (err) => {
      if (err) console.error(err);
    }
  );
  db.run(
    "insert or ignore into eventTypes(typeId, type) values (0, 'DRAW');",
    (err) => {
      if (err) console.error(err);
    }
  );
  db.run(
    "insert or ignore into eventTypes(typeId, type) values (1, 'WRITE');",
    (err) => {
      if (err) console.error(err);
    }
  );

  db.run(
    "create table if not exists events (" +
      "id integer primary key," +
      "url text," +
      "eventType int," +
      "event text," +
      "foreign key(eventType) references eventTypes(typeId)" +
      ");",
    (err) => {
      if (err) console.error(err);
    }
  );
});

exports.addDrawEvent = (url, event) => {
  db.run(
    "insert into events(url, event, eventType) values(?, ?, 0);",
    [url, event],
    (err) => {
      if (err) console.log(err);
    }
  );
};

exports.getAllDrawEvents = (url, callback) => {
  db.all(
    "select event from events where url = ? and eventType = 0 order by id asc;",
    url,
    (err, rows) => {
      if (err) console.log(err);
      const rowsString = "[" + rows.map((r) => r.event).join(",") + "]";
      callback(rowsString);
    }
  );
};

exports.addWriteEvent = (url, event) => {
  db.run(
    "insert into events(url, event, eventType) values(?, ?, 1);",
    [url, event],
    (err) => {
      if (err) console.log(err);
    }
  );
};

exports.getLatestWriteEvents = (url, writeIdx, callback) => {
  db.all(
    "select id, event from events where url = ? and id > ? and eventType = 1 order by id asc;",
    [url, writeIdx],
    (err, rows) => {
      if (err) console.log(err);
      callback(rows);
    }
  );
};