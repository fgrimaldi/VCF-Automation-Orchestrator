var csvString;

// 1️⃣ Read the MimeAttachment content
if (mimeAttachment.content) {
    // content is already CSV string
    csvString = mimeAttachment.content;
    System.debug("ℹ️ MimeAttachment read from content (CSV string)");
} else if (mimeAttachment.buffer) {
    // buffer is a byte array
    csvString = String.fromCharCode.apply(null, mimeAttachment.buffer);
    System.debug("ℹ️ MimeAttachment read from buffer (byte array)");
} else {
    throw "❌ MimeAttachment not readable: no content or buffer";
}

// 2️⃣ Split CSV into rows and columns
var lines = csvString.split(/\r?\n/).filter(function (line) { return line.trim() !== ''; });
if (lines.length === 0) return [];

var headers = lines[0].split(';').map(function (h) { return h.trim(); });
var data = [];
for (var i = 1; i < lines.length; i++) {
    var values = lines[i].split(';').map(function (v) { return v.trim(); });
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[j];
    data.push(obj);
}

System.debug("ℹ️ Parsed CSV rows: " + data.length);

// 3️⃣ Filter VMware and map only server/app_id
var result = data.filter(function (row) {
    return row.virtualization && row.virtualization.toLowerCase() === 'vmware';
}).map(function (row) {
    return { server: row.server, app_id: row.app_id };
});

System.log("CSV parsing Result: " + JSON.stringify(result));
return result;
