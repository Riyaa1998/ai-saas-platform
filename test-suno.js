const sunoApi = require('suno-api');
console.log('Suno API structure:', Object.keys(sunoApi));
console.log('Suno API Status values:', sunoApi.Status);
console.log('Suno API Api methods:', Object.getOwnPropertyNames(sunoApi.Api.prototype));
console.log('Suno API constants:', sunoApi.constants); 