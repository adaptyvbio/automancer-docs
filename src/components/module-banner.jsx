import * as React from 'react';


export function ModuleBanner(props) {
  return (
    <div className="modulebanner-root">
      <div className="modulebanner-title">{props.title}</div>
      <div className="modulebanner-version">Version: {props.version}</div>
      <div className="modulebanner-builtin">Built-in</div>
    </div>
  )
}
