'use strict';

function Cache(name) {
  this.name = name;
	this.responses = {};
	this.count = 0;
	this.maxItems = 10;
	this.order = [];
}

function parseQuery(query) {
  var id;
  if (query) {
    id = JSON.stringify(query);
  }
  else {
    id = '*';
  }
  return id;
}

var removeIdQueriesWithout_Id = function(responses) {
  var toRemove = [];
  for (var id in responses) {
    var query = JSON.parse(id).query;
    if (!query._id) {
      toRemove.push(id);
    }
  }
  toRemove.forEach(function(id) {
    delete responses[id];
  });
}

Cache.prototype.get = function(query) {
  var id = parseQuery(query);
	return this.responses[id];
};
Cache.prototype.updateAll = function(updatedItem, deleted) {
  removeIdQueriesWithout_Id(this.responses);
  for (var id in this.responses) {
    var response = this.responses[id];
    var newResponse = [];
    response.forEach(function(item) {
      if (deleted) {
        return;
      }
      if (item._id === updatedItem._id) {
        newResponse.push(updatedItem);
      }
      else {
        newResponse.push(item);
      }
    });
    this.responses[id] = newResponse;
  }
};
Cache.prototype.add = function(query, response) {
  var id = parseQuery(query);
	if (this.count < this.maxItems) {
		this.order.push(id);
		this.responses[id] = response;
		this.count++;
	}
	else {
		var old = this.order[0];
		this.order.splice(0,1);
		delete this.responses[old];
		this.responses[id] = response;
		this.order.push(id);
	}
};

Cache.prototype.clear = function() {
	this.responses = {};
  this.order = [];
	this.count = 0;
};
Cache.prototype.getData = function() {
	return this.responses;
};
module.exports = Cache;
