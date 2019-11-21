module.exports = (inputText) => {
    let colors = ["\x1b[32m", "\x1b[33m", "\x1b[34m", "\x1b[35m", "\x1b[36m", "\x1b[37m"];
    let ret = "";
    for (s in inputText) {
        ret += "\x1b[40m" + colors[Math.floor(Math.random() * colors.length)] + inputText.charAt(s) + "\x1b[0m";
    }


    return ret;
};