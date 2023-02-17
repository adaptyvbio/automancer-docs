<%
  import os

  import pdoc
  from pdoc.html_helpers import extract_toc, glimpse, to_html as _to_html, format_git_link

  def link(dobj: pdoc.Doc, class_name: str = str(), name=None):
    name = name or dobj.qualname + ('()' if isinstance(dobj, pdoc.Function) else '')
    if isinstance(dobj, pdoc.External) and not external_links:
        return name
    url = dobj.url(relative_to=module, link_prefix=link_prefix,
                   top_ancestor=not show_inherited_members)
    return f'<a class="{class_name}" title="{dobj.refname}" href="{url}"><div class="text"><code>{name}</code></div></a>'

  def to_html(text):
    return _to_html(text, docformat=docformat, module=module, link=link, latex_math=latex_math)

  def get_annotation(bound_method, sep=':'):
    annot = show_type_annotations and bound_method(link=link) or ''
    if annot:
        annot = ' ' + sep + '\N{NBSP}' + annot
    return annot
%>


<%def name="show_module_list(modules)">
  <div id="root">
    <div class="title">
      <div class="title-text">Documentation</div>
    </div>
    <div class="bar">
      <nav class="bar-current">

      </nav>
    </div>
    <aside class="aside">

    </aside>
    <div class="center">
      <main class="main">
        <h1>Module list</h1>

        % if not modules:
          <p>No modules found.</p>
        % else:
          <dl id="http-server-module-list">
          % for name, desc in modules:
              <div class="flex">
              <dt><a href="${link_prefix}${name}">${name}</a></dt>
              <dd>${desc | glimpse, to_html}</dd>
              </div>
          % endfor
        % endif
      </main>
    </div>
  </div>
</%def>

<%def name="show_module(module)">
  <%
  variables = module.variables(sort=sort_identifiers)
  classes = module.classes(sort=sort_identifiers)
  functions = module.functions(sort=sort_identifiers)
  submodules = module.submodules()
  %>
  <div id="root">
    <div class="title">
      <div class="title-text">Documentation</div>
    </div>
    <div class="bar">
      <nav class="bar-current">
        <div class="item">
          <a href="/" class="item-link">All packages</a>
        </div>
        <% parts = module.name.split('.')[:-1] %>
        % for i, m in enumerate(parts):
          <% parent = '.'.join(parts[:i+1]) %>
          <div class="item">
            <a href="/${parent.replace('.', '/')}/" class="item-link">
              <code>${parent}</code>
            </a>
          </div>
        % endfor
      </nav>
    </div>
    <aside class="aside">
      ## {props.sectionEntry && (
      ##   <div class="product">
      ##     <a href={props.siteUrl} class="product-back">Home</a>
      ##     <a href={props.sectionEntry.outUrl} class="product-title">{props.sectionEntry.title}</a>
      ##   </div>
      ## )}
      <nav class="list">
        % if submodules:
          <div class="item">
            <div class="section">Submodules</div>
            <div class="list">
              % for submodule in submodules:
                ## <div class={formatClass('item', { '_active': entry === props.entry })}>
                <div class="item">
                  ${link(submodule, class_name="item-link")}
                </div>
              % endfor
              ## {props.navigation.map(({ entry }) => (
              ##   <div class={formatClass('item', { '_active': entry === props.entry })}>
              ##     <a href={entry.outUrl} class="item-link">{entry.title}</a>
              ##   </div>
              ## ))}
            </div>
          </div>
        % endif
      </nav>
    </aside>
    <div class="center">
      <main class="main">
        <h1>
          ${'Namespace' if module.is_namespace else  \
            'Package' if module.is_package and not module.supermodule else \
            'Module'} <code>${module.name}</code>
        </h1>

        % if classes:
          <h2>Classes</h2>
          <dl>
            % for c in classes:
              <%
              class_vars = c.class_variables(show_inherited_members, sort=sort_identifiers)
              smethods = c.functions(show_inherited_members, sort=sort_identifiers)
              inst_vars = c.instance_variables(show_inherited_members, sort=sort_identifiers)
              methods = c.methods(show_inherited_members, sort=sort_identifiers)
              mro = c.mro()
              subclasses = c.subclasses()
              params = ', '.join(c.params(annotate=show_type_annotations, link=link))
              %>
              <dt id="${c.refname}"><code class="flex name class">
                  <span>class ${c.name}</span>
                  % if params:
                      <span>(</span><span>${params})</span>
                  % endif
              </code></dt>
              <dd>
            ## ${show_desc(c)}
            ## % if mro:
            ##     <h3>Ancestors</h3>
            ##     <ul class="hlist">
            ##     % for cls in mro:
            ##         <li>${link(cls)}</li>
            ##     % endfor
            ##     </ul>
            ## %endif
            ## % if subclasses:
            ##     <h3>Subclasses</h3>
            ##     <ul class="hlist">
            ##     % for sub in subclasses:
            ##         <li>${link(sub)}</li>
            ##     % endfor
            ##     </ul>
            ## % endif
            ## % if class_vars:
            ##     <h3>Class variables</h3>
            ##     <dl>
            ##     % for v in class_vars:
            ##         <% return_type = get_annotation(v.type_annotation) %>
            ##         <dt id="${v.refname}"><code class="name">var ${ident(v.name)}${return_type}</code></dt>
            ##         <dd>${show_desc(v)}</dd>
            ##     % endfor
            ##     </dl>
            ## % endif
            ## % if smethods:
            ##     <h3>Static methods</h3>
            ##     <dl>
            ##     % for f in smethods:
            ##         ${show_func(f)}
            ##     % endfor
            ##     </dl>
            ## % endif
            ## % if inst_vars:
            ##     <h3>Instance variables</h3>
            ##     <dl>
            ##     % for v in inst_vars:
            ##         <% return_type = get_annotation(v.type_annotation) %>
            ##         <dt id="${v.refname}"><code class="name">var ${ident(v.name)}${return_type}</code></dt>
            ##         <dd>${show_desc(v)}</dd>
            ##     % endfor
            ##     </dl>
            ## % endif
            ## % if methods:
            ##     <h3>Methods</h3>
            ##     <dl>
            ##     % for f in methods:
            ##         ${show_func(f)}
            ##     % endfor
            ##     </dl>
            ## % endif
            ## % if not show_inherited_members:
            ##     <%
            ##         members = c.inherited_members()
            ##     %>
            ##     % if members:
            ##         <h3>Inherited members</h3>
            ##         <ul class="hlist">
            ##         % for cls, mems in members:
            ##             <li><code><b>${link(cls)}</b></code>:
            ##                 <ul class="hlist">
            ##                     % for m in mems:
            ##                         <li><code>${link(m, name=m.name)}</code></li>
            ##                     % endfor
            ##                 </ul>
            ##             </li>
            ##         % endfor
            ##         </ul>
            ##     % endif
            ## % endif
            </dd>
          % endfor
          </dl>
        % endif
      </section>
      </main>
      <div class="toc">
        <div class="toc-title">In this article</div>
        <div class="list">
          <div class="item">
            <a href="#" class="item-link">About workflows</a>
          </div>
          <div class="item">
            <a href="#" class="item-link">About workflows</a>
            <div class="list">
              <a href="#" class="item-link">About workflows</a>
              <a href="#" class="item-link">About workflows</a>
            </div>
          </div>
          <div class="item">
            <a href="#" class="item-link">About workflows</a>
            <div class="list">
              <a href="#" class="item-link">About workflows</a>
              <a href="#" class="item-link">About workflows very very very very long</a>
            </div>
          </div>
          <div class="item">
            <a href="#" class="item-link">About workflows</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</%def>

<%
  is_module_list = 'modules' in context.keys()
%>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    % if is_module_list:
      <title>Python module list</title>
      <meta name="description" content="A list of documented Python modules." />
    % else:
      <title>${module.name} documentation</title>
      <meta name="description" content="${module.docstring | glimpse, trim, h}" />
    % endif
    <link href="http://localhost:8080/styles.css" rel="stylesheet" />
    ## <link rel="icon" type="image/png" href={site('assets/favicon.png')} />
    <script type="module" defer>
      import highlightJs from 'https://cdn.skypack.dev/highlight.js';
      highlightJs.highlightAll();

      let head = document.querySelector('head');
      let link = document.createElement('link');

      link.href = 'https://cdn.skypack.dev/highlight.js/styles/github.css';
      link.rel = 'stylesheet';

      head.appendChild(link);
    </script>
  </head>
  <body>
    % if is_module_list:
      ${show_module_list(modules)}
    % else:
      ${show_module(module)}
    % endif
  </body>
</html>
