var qrcode;

new Vue({
  el: "#app",
  computed: {
    pasteboardLength() {
      if (!this.pasteboard) {
        return 0;
      }
      return this.pasteboard.replace(/\n/g, "").length;
    },
    pasteboardSum() {
      if (!this.pasteboard) {
        return 0;
      }
      return this.pasteboard
        .split("\n")
        .map(item => {
          if (item === "") {
            return 0;
          }
          if (isNaN(item)) {
            return 0;
          }
          return parseFloat(item);
        })
        .reduce((a, b) => {
          return a + b;
        });
    }
  },
  methods: {
    printMarkdown() {
      var win = window.open("", "newtab");
      var md = markdownit().render(this.pasteboard);
      const html = `
      <html>
      <head>
      <title></title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.min.css">
      </head>
      <body>
        ${md}
      </body>
      </html>
      `;

      win.document.write(html);
    },
    update(type, ev) {
      let val;
      switch (type) {
        case "hex":
          val = this.hex.replace(/ /g, "");
          if (val) {
            this.decimal = parseInt(val, 16);
            this.binary = this.decimal.toString(2);
          }
          break;
        case "decimal":
          val = parseInt(this.decimal, 10);
          if (val) {
            this.hex = val.toString(16);
            this.binary = val.toString(2);
          }
          break;
        case "binary":
          val = this.binary.replace(/ /g, "");
          if (val) {
            this.decimal = parseInt(val, 2);
            this.hex = this.decimal.toString(16);
          }
          break;
      }
    }
  },
  data: {
    hex: "",
    decimal: "",
    binary: "",
    pasteboard: "",
    generateQr: false
  },
  watch: {
    pasteboard(value) {
      localStorage.setItem("hashrock-calc__pasteboard", value);

      if (this.generateQr) {
        qrcode.clear();
        qrcode.makeCode(this.pasteboard);
      }
    },
    generateQr(value) {
      if (!qrcode) {
        qrcode = new QRCode(document.getElementById("qrcode"), {
          text: "",
          width: 128,
          height: 128,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
      if (value) {
        qrcode.clear();
        qrcode.makeCode(this.pasteboard);
      }
    }
  },
  mounted() {
    if (localStorage.getItem("hashrock-calc__pasteboard")) {
      this.pasteboard = localStorage.getItem("hashrock-calc__pasteboard");
    }
  }
});
