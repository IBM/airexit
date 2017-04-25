var Collections = {
  'User': {
    name: { type: String, required: true, unique: true },
    admin: Boolean,
    email: { type: String, required: true, unique: true },
    created_by: String,
    created_at: Date,
    updated_by: String,
    updated_at: Date,
    deleted: Boolean
  },
  'Squads': {
    name: { type: String, required: true, unique: true},
    description: String,
    created_by: String,
    created_at: Date,
    updated_by: String,
    updated_at: Date
  },
  'Charts': {
    name: { type: String, required: true },
    url: { type: String, required: true },
    options: { type: String, required: true },
    transformFunction: { type: String, required: true },
    squad: { type: String, required: true },
    created_by: { type: String, required: true },
    created_at: Date,
    updated_at: Date,
    updated_by: String
  },
  'Reports': {
    name: { type: String, required: true },
    charts: { type: String, required: true },
    created_by: { type: String, required: true },
    created_at: Date,
    updated_at: Date,
    updated_by: String
  }/*,
  'Notifications': {
    userId: { type: String, required: true, unique: true },
    notifications: { type: String }
  }*/
}
var collections = [];
for (var key in Collections) {
  collections.push({
    name: key,
    definition: Collections[key]
  });
}

module.exports = collections;
