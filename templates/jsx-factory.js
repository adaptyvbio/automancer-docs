function createElement(tag, attributes, ...children) {
  let attributesRendered = Object.entries(attributes ?? {}).map(([key, value]) => ` ${key}="${value}"`).join('');

  if (tag === Fragment) {
    return children.map((child) => renderChild(child)).join('');
  }

  return `<${tag}${attributesRendered}>${children.map((child) => renderChild(child)).join('')}</${tag}>`;
}

const Fragment = Symbol();

function renderChild(child) {
  if ([false, null, undefined].includes(child)) {
    return '';
  }

  if (Array.isArray(child)) {
    return child.map((subchild) => renderChild(subchild)).join('');
  }

  return child.render
    ? child.render()
    : child.toString();
}

export {
  createElement as 'React.createElement',
  Fragment as 'React.Fragment'
}
