import { Text } from "react-native";

// These rules make sure everything can be selected

const markdownRules = {
  strong: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.strong} selectable>
      {children}
    </Text>
  ),
  em: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.em} selectable>
      {children}
    </Text>
  ),
  s: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.s} selectable>
      {children}
    </Text>
  ),
  code_inline: (node, children, parent, styles, inheritedStyles = {}) => (
    <Text
      key={node.key}
      style={[inheritedStyles, styles.code_inline]}
      selectable
    >
      {node.content}
    </Text>
  ),
  code_block: (node, children, parent, styles, inheritedStyles = {}) => {
    // we trim new lines off the end of code blocks because the parser sends an extra one.
    let { content } = node;

    if (
      typeof node.content === "string" &&
      node.content.charAt(node.content.length - 1) === "\n"
    ) {
      content = node.content.substring(0, node.content.length - 1);
    }

    return (
      <Text
        key={node.key}
        style={[inheritedStyles, styles.code_block]}
        selectable
      >
        {content}
      </Text>
    );
  },
  fence: (node, children, parent, styles, inheritedStyles = {}) => {
    // we trim new lines off the end of code blocks because the parser sends an extra one.
    let { content } = node;

    if (
      typeof node.content === "string" &&
      node.content.charAt(node.content.length - 1) === "\n"
    ) {
      content = node.content.substring(0, node.content.length - 1);
    }

    return (
      <Text key={node.key} style={[inheritedStyles, styles.fence]} selectable>
        {content}
      </Text>
    );
  },
  link: (node, children, parent, styles, onLinkPress) => (
    <Text
      key={node.key}
      style={styles.link}
      onPress={() => openUrl(node.attributes.href, onLinkPress)}
      selectable
    >
      {children}
    </Text>
  ),
  text: (node, children, parent, styles, inheritedStyles = {}) => (
    <Text key={node.key} style={[inheritedStyles, styles.text]} selectable>
      {node.content}
    </Text>
  ),
  textgroup: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.textgroup} selectable>
      {children}
    </Text>
  ),
  hardbreak: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.hardbreak} selectable>
      {"\n"}
    </Text>
  ),
  softbreak: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.softbreak} selectable>
      {"\n"}
    </Text>
  ),
  inline: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.inline} selectable>
      {children}
    </Text>
  ),
  span: (node, children, parent, styles) => (
    <Text key={node.key} style={styles.span} selectable>
      {children}
    </Text>
  ),
};

export default markdownRules;
