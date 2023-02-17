import util from 'util';


export default (props) => {
  let site = (pathname) => props.siteUrl + pathname;

  // console.log(util.inspect(props, { colors: true, depth: 1/0 }));

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <title>{props.title}</title>
        <link href={site('styles.css')} rel="stylesheet" />
        <link rel="icon" type="image/png" href={site('assets/favicon.png')} />
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
        <div id="root">
          <div class="title">
            <div class="title-text">Documentation</div>
          </div>
          <div class="bar">
            <nav class="bar-current">
              {props.breadcumb.map((entry) => (
                <div class="item">
                  <a href={entry.outUrl} class="item-link">{entry.title}</a>
                </div>
              ))}
            </nav>
          </div>
          <aside class="aside">
            {props.sectionEntry && (
              <div class="product">
                <a href={props.siteUrl} class="product-back">Home</a>
                <a href={props.sectionEntry.outUrl} class="product-title">{props.sectionEntry.title}</a>
              </div>
            )}
            <nav class="list">
              <div class="item">
                <div class="section">Expressions</div>
                <div class="list">
                  {props.navigation.map(({ entry }) => (
                    <div class="item">
                      <a href={entry.outUrl} class="item-link">{entry.title}</a>
                    </div>
                  ))}
                </div>
              </div>
            </nav>

              {/* <!-- <div class="item">
                <a href="#" class="item-link">Quickstart</a>
              </div>
              <div class="item">
                <a href="#" class="item-link">Quickstart</a>
              </div>
              <div class="item _open">
                <a href="#" class="item-link">Quickstart</a>
                <div class="list">
                  <div class="item">
                    <a href="#" class="item-link _active">Manage theme settings</a>
                  </div>
                  <div class="item">
                    <a href="#" class="item-link">Manage theme settings</a>
                  </div>
                  <div class="item">
                    <a href="#" class="item-link">Manage theme settings</a>
                  </div>
                </div>
              </div>
              <div class="item">
                <a href="#" class="item-link">Quickstart</a>
              </div> -->
            </nav> */}
          </aside>
          <div class="center">
            <main class="main">
              {props.contents}
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
      </body>
    </html>
  );
}
