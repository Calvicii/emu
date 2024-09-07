import { StyleSheet } from 'react-native';

const markdownStyles = StyleSheet.create({
  body: {
    color: "white",
    fontFamily: "Outfit-Regular",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  blockquote: {
    backgroundColor: "transparent",
  },
  code_block: {
    backgroundColor: "transparent",
  },
  code_inline: {
    backgroundColor: "#fff2",
  },
  fence: {
    marginVertical: 10,
    backgroundColor: "transparent",
  },
  table: {
    borderColor: "#ccc",
  },
  tr: {
    borderColor: "#ccc",
  },
  blocklink: {
    borderColor: "#ccc",
  },
});

export default markdownStyles;