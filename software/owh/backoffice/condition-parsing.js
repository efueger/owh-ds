function fetchConditionsJSONFromUDC(id, keyDelimiter, keyIndex) {
    var keys = [];
    var titles = [];
    jQuery(document.getElementById(id)).find('option').slice(1).each(function (i, option) {
        var key = jQuery(option).attr('value');
        var title = jQuery(option).text();
        title = title.replace('†', '');
        title = title.replace('*', '');
        title = title.trim().indexOf('-') === 0 ? title.replace('-', ' ') : title;
        if(title.trim().indexOf(key) === 0) {
            var titleToken1 = title.substring(0, title.indexOf(key));
            var titleToken2 = title.substring(title.indexOf(key) + key.length);
            titleToken2 = titleToken2.trim();
            titleToken2 = titleToken2.indexOf('(') === 0 ? titleToken2.replace('(', '') : title;
            titleToken2 = titleToken2.replace(/\)$/, "");
            titleToken2 = titleToken2 + ' (' + key + ')';
            title = titleToken1 + titleToken2;
        }
        titles.push(title);

        if(keyDelimiter) {
            var splits = key.split(keyDelimiter);
            key = splits[keyIndex ? Number(keyIndex) : splits.length - 1];
        } else {
            key = key.replace(/\./g,'');
        }
        keys.push(key);
    });
    var conditionsJSON = getConditionsJSON(keys, titles, 0);
    var conditionPathsJSON = getConditionPathsJSON(conditionsJSON.nestedConditions);
    function getConditionPathsJSON(conditionsJSON, parentPaths) {
        parentPaths = parentPaths ? parentPaths : [];
        var conditionPaths = {};
        jQuery.each(conditionsJSON, function(index, eachCondition){
            var paths = parentPaths.concat([eachCondition.id]);
            conditionPaths[eachCondition.id] = paths;
            if(eachCondition.children) {
                conditionPaths = jQuery.extend(conditionPaths, getConditionPathsJSON(eachCondition.children, paths));
            }
        });
        return conditionPaths;
    }
    function getConditionsJSON(keys, titles, startIndex) {
        var nestedConditions = [];
        var simpleConditions = [];
        var prevOptionSpaceLength;
        var i = startIndex;
        for (; i < keys.length; i++) {

            var currentOptionSpaceLength = titles[i].search(/\S/);

            if (prevOptionSpaceLength === undefined) {
                prevOptionSpaceLength = currentOptionSpaceLength;
            }
            if (currentOptionSpaceLength === prevOptionSpaceLength) {
                nestedConditions.push({
                    id: keys[i].trim(),
                    text: titles[i].trim()
                });
                simpleConditions.push({
                    key: keys[i].trim(),
                    title: titles[i].trim()
                });
            } else if (currentOptionSpaceLength > prevOptionSpaceLength) {
                var result = getConditionsJSON(keys, titles, i);
                nestedConditions[nestedConditions.length - 1].children = result.nestedConditions;
                simpleConditions = simpleConditions.concat(result.simpleConditions);
                i = result.endIndex;
            } else {
                break;
            }
        }
        return {
            nestedConditions: nestedConditions,
            simpleConditions: simpleConditions,
            endIndex: i - 1
        };
    }
    return {conditionsJSON: conditionsJSON, conditionPathsJSON: conditionPathsJSON};
}

function getPathsJSON(json, parentPaths) {
    parentPaths = parentPaths ? parentPaths : [];
    var pathsJSON = {};
    var autoCompleteOptions = [];
    jQuery.each(json, function(index, eachJSON){
        var paths = parentPaths.concat([eachJSON.id]);
        pathsJSON[eachJSON.text] = {
            key: eachJSON.id,
            path: paths
        };
        autoCompleteOptions.push({
            key: eachJSON.id,
            title: eachJSON.text
        });
        if(eachJSON.children) {
            var result = getPathsJSON(eachJSON.children, paths);
            pathsJSON = jQuery.extend(pathsJSON, result.pathsJSON);
            autoCompleteOptions = autoCompleteOptions.concat(result.autoCompleteOptions);
        }
    });
    return {
        pathsJSON: pathsJSON,
        autoCompleteOptions: autoCompleteOptions
    };
}
