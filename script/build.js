/* eslint-disable */
const yParser = require('yargs-parser');
const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');
const { terser } = require('rollup-plugin-terser');
const cleanup = require('rollup-plugin-cleanup');
const filesize = require('rollup-plugin-filesize');
const progress = require('rollup-plugin-progress');
const babel = require('@rollup/plugin-babel');
const path = require('path');
const fs = require('fs');

const args = yParser(process.argv.slice(2));
const filter = ({ target }) =>
  !args.t ? true : args.t.split(',').includes(target);
const way = (route) => path.join(__dirname, route);
const targets = [
  {
    target: 'mp',
    entrys: ['default', 'sdk', 'base', 'wx', 'tt', 'qq', 'swan', 'my'],
  },
];
const envs = [
  {
    which: 'tob',
    env: {},
  },
];

const sharePlugins = [
  'ab',
  'monitor',
  'compensate',
  'robot',
  'trace',
  'utm',
  'verify',
];

const selfPlugins = ['auto', 'extend'];

const babelPluginConfig = [
  babel.babel({
    cwd: way('../'),
    extensions: ['.js', '.ts'],
    babelHelpers: 'bundled',
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: false,
        },
      ],
    ],
  }),
];

envs
  .filter(({ which }) => (!args.e ? true : args.e.split(',').includes(which)))
  .forEach(({ which, whichProxy, env, filterPlugin, filterEntry }) => {
    [
      ...targets
        .filter(filter)
        .reduce((all, { target, entrys, targetFilterPlugin }) => {
          const pkg = require(way(
            `../src/${target}/${which}/pkg/package.json`
          ));
          entrys
            .filter((entry) => {
              if (
                filterEntry &&
                filterEntry[target] &&
                filterEntry[target].includes(entry)
              ) {
                return false;
              }
              return true;
            })
            .forEach((entry) => {
              const config = {
                input: way(
                  `../src/${target}/${whichProxy || which}/${entry}.ts`
                ),
              };
              const filePath = way(`../src/${target}/${which}/pkg/VERSION`);
              const sdkInfo = {
                SDK_VERSION: fs.readFileSync(filePath).toString(),
                SDK_NAME: pkg.name,
              };
              const esmConfig = {
                ...config,
                output: {
                  file: way(`../dist/${which}/${target}/esm/${entry}.js`),
                  format: 'esm',
                },
                env: {
                  ...env,
                  ...sdkInfo,
                },
              };
              if (entry === 'default') {
                all.push({
                  ...esmConfig,
                  output: {
                    ...esmConfig.output,
                    file: way(`../dist/${which}/${target}/index.js`),
                  },
                  env: {
                    ...esmConfig.env,
                    isIndex: true,
                  },
                  plugins: [
                    copy({
                      targets: [
                        {
                          src: way(
                            `../src/${target}/${which}/pkg/package.json`
                          ),
                          dest: way(`../dist/${which}/${target}`),
                          rename: `package.json`,
                          transform: (contents) => {
                            const filePath = way(
                              `../src/${target}/${which}/pkg/VERSION`
                            );
                            return contents
                              .toString()
                              .replace('{VERSION}', fs.readFileSync(filePath));
                          },
                        },
                        {
                          src: way(`../src/${target}/${which}/pkg/README.md`),
                          dest: way(`../dist/${which}/${target}`),
                          rename: `README.md`,
                        },
                        {
                          src: way(
                            `../src/${target}/${
                              whichProxy || which
                            }/pkg/sdk.d.ts`
                          ),
                          dest: way(`../dist/${which}/${target}`),
                          rename: `sdk.d.ts`,
                        },
                        {
                          src: way(`../src/tpl/default.d.tpl`),
                          dest: way(`../dist/${which}/${target}`),
                          rename: `index.d.ts`,
                          transform: (contents) => {
                            return contents
                              .toString()
                              .replace('{SDK_TYPE_PATH}', './sdk.d');
                          },
                        },
                      ],
                    }),
                  ],
                });
              } else {
                all.push({
                  ...esmConfig,
                  plugins: [
                    copy({
                      targets: [
                        {
                          src: way(`../src/tpl/entry.d.tpl`),
                          dest: way(`../dist/${which}/${target}/esm/`),
                          rename: `${entry}.d.ts`,
                        },
                      ],
                    }),
                  ],
                });
              }

              all.push({
                ...config,
                env: {
                  ...env,
                  isUmd: true,
                  ...sdkInfo,
                },
                output:
                  entry === 'default'
                    ? {
                        file: way(`../dist/${which}/${target}/index.umd.js`),
                        format: 'umd',
                        name: '$$TEA',
                      }
                    : {
                        file: way(`../dist/${which}/${target}/umd/${entry}.js`),
                        format: 'umd',
                        name: '$$LOGSDK',
                      },
                plugins: [
                  ...babelPluginConfig,
                  copy({
                    targets: [
                      ...(entry === 'default'
                        ? [
                            {
                              src: way(`../src/tpl/default.d.tpl`),
                              dest: way(`../dist/${which}/${target}/`),
                              rename: `index.umd.d.ts`,
                              transform: (contents) => {
                                return contents
                                  .toString()
                                  .replace('{SDK_TYPE_PATH}', './sdk.d');
                              },
                            },
                          ]
                        : [
                            {
                              src: way(`../src/tpl/entry.d.tpl`),
                              dest: way(`../dist/${which}/${target}/umd/`),
                              rename: `${entry}.d.ts`,
                            },
                          ]),
                    ],
                  }),
                ],
              });
            });
          [
            ...[...sharePlugins, ...selfPlugins]
              .filter(
                (plugin) => !(filterPlugin && filterPlugin.includes(plugin))
              )
              .filter(
                (plugin) =>
                  !(targetFilterPlugin && targetFilterPlugin.includes(plugin))
              )
              .map((plugin) => {
                return {
                  config: {
                    input: selfPlugins.includes(plugin)
                      ? way(`../src/${target}/plugin/${plugin}.ts`)
                      : way(`../src/plugin/${plugin}.ts`),
                  },
                  which,
                  target,
                  plugin,
                };
              }),
          ].forEach(({ config, which, target, plugin }) => {
            all.push({
              ...config,
              output: {
                file: way(`../dist/${which}/${target}/esm/plugin/${plugin}.js`),
                format: 'esm',
              },
              plugins: [
                copy({
                  targets: [
                    {
                      src: way(`../src/tpl/plugin.d.tpl`),
                      dest: way(`../dist/${which}/${target}/esm/plugin/`),
                      rename: `${plugin}.d.ts`,
                    },
                  ],
                }),
              ],
            });
            all.push({
              ...config,
              env: {
                ...env,
                isUmd: true,
              },
              output: {
                file: way(`../dist/${which}/${target}/umd/plugin/${plugin}.js`),
                format: 'umd',
                name: `$$LOGSDK_PLUGIN_${plugin.toUpperCase()}`,
              },
              plugins: [
                ...babelPluginConfig,
                copy({
                  targets: [
                    {
                      src: way(`../src/tpl/plugin.d.tpl`),
                      dest: way(`../dist/${which}/${target}/umd/plugin/`),
                      rename: `${plugin}.d.ts`,
                    },
                  ],
                }),
              ],
            });
          });
          return all;
        }, []),
    ].forEach((config) => {
      if (!config.env) {
        config.env = env;
      }
      run(config);
    });
  });

async function run(config) {
  const { env } = config;
  delete config.env;
  const defaultConfig = {
    external: (id) => {
      if (env.isUmd || env.isIndex) {
        return false;
      }
      if (
        /plugin\/(device|info|token|report|buffer|transform|profile)/.test(id)
      ) {
        return false;
      }
      return /\/plugin\//.test(id);
    },
    plugins: [
      typescript({
        tsconfig: way('../tsconfig.json'),
        typescript: require('typescript'),
      }),
      replace({
        preventAssignment: true,
        delimiters: ['', ''],
        values: {
          'process.env.SDK_VERSION': JSON.stringify(env.SDK_VERSION),
          'process.env.SDK_NAME': JSON.stringify(env.SDK_NAME),
          ...(env.isUmd || env.isIndex
            ? {}
            : {
                ...[...sharePlugins, ...selfPlugins].reduce(
                  (replaces, plugin) => {
                    if (selfPlugins.includes(plugin)) {
                      replaces[`../plugin/${plugin}`] = `./plugin/${plugin}`;
                    } else {
                      replaces[`../../plugin/${plugin}`] = `./plugin/${plugin}`;
                    }
                    return replaces;
                  },
                  {}
                ),
              }),
        },
      }),
      terser({
        compress: {
          if_return: false,
          side_effects: false,
        },
      }),
      cleanup({
        comments: 'none',
      }),
      filesize(),
      progress(),
    ],
  };
  const { output, ...input } = {
    ...defaultConfig,
    ...config,
    ...(config.plugins
      ? { plugins: [...defaultConfig.plugins, ...config.plugins] }
      : {}),
  };
  const bundle = await rollup.rollup(input).catch((...rest) => {
    console.log(rest);
  });
  if (Array.isArray(output)) {
    for (const eachOutput of output) {
      await bundle.write(eachOutput);
    }
  } else {
    await bundle.write(output);
  }
}
