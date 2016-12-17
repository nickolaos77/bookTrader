exports.adder = function(a) {
  return a + 2;
};

MongoClient.connect(url, (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => {
    console.log('Express listening on port '+ PORT + '!');
  })
})