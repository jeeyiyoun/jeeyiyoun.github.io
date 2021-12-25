const prefix = "__framer__";
const prefixLength = prefix.length;
export function extractPrefixedProps(props) {
    const result = {};
    const rest = {};
    for (const key in props) {
        if (key.startsWith(prefix)) {
            result[key.substr(prefixLength)] = props[key];
        }
        else {
            rest[key] = props[key];
        }
    }
    return [result, rest];
}
//# sourceMappingURL=hocOptions.js.map