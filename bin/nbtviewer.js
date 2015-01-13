#! /usr/bin/env node
/**
 * XadillaX created at 2015-01-13 12:57:40
 *
 * Copyright (c) 2015 Huaban.com, all rights
 * reserved
 */
var fs = require("fs");
var async = require("async");
var NBT = require("mcnbt");
var opts = require("nomnom").script("nbtv[iewer]").option("indent", {
    abbr: "d",
    default: 2,
    help: "The output JSON indent"
}).option("output", {
    abbr: "o",
    help: "The output filename. If no file specified, it will be printed at console"
}).option("input", {
    position: 0,
    help: "The input filename",
    required: true,
    callback: function(ipt) {
        return fs.existsSync(ipt) ? undefined : ("No such input file: " + ipt + ".");
    }
}).option("version", {
    abbr: "v",
    help: "Show the version of nbtv",
    flag: true,
    callback: function() {
        var pkg = require("../package");
        return "nbtviewer v" + pkg.version;
    }
}).option("help", {
    abbr: "h",
    help: "Show the help information"
}).parse();

var nbt = new NBT();
var loaded = false;

async.waterfall([
    /**
     * step 1.
     *   try zlib first.
     */
    function(callback) {
        nbt.loadFromZlibCompressedFile(opts.input, function(err) {
            if(err) {
                nbt = new NBT();
                return callback();
            }

            loaded = true;
            return callback();
        });
    },

    /**
     * step 2.
     *   try normal second
     */
    function(callback) {
        if(loaded) return callback();
        nbt.loadFromFile(opts.input, function(err) {
            if(err) return callback(err);
            loaded = true;
            return callback();
        });
    }
], function(err) {
    if(err) {
        return console.error(err);
    }

    var json = nbt.toJSON();
    if(!opts.indent) {
        json = JSON.stringify(json);
    } else {
        json = JSON.stringify(json, true, opts.indent);
    }

    if(!opts.output) {
        return console.log(json);
    }

    fs.writeFile(opts.output, json, "utf8", function(err) {
        if(err) {
            return console.error(err);
        }

        console.log("done.");
    });
});

