/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('unified').RunCallback} RunCallback
 * @typedef {import('unified').Transformer} Transformer
 * @typedef {import('unist').Node} Node
 */

import {toMdast} from 'hast-util-to-mdast'

/**
 * Attacher.
 *
 * If a destination is given, runs the destination with the new mdast
 * tree (bridge-mode). Without destination, returns the mdast tree: further
 * plugins run on that tree (mutate-mode).
 *
 * @param destination Optional unified processor.
 * @param options Options passed to `hast-util-to-mdast`.
 */
const rehypeRemark =
  /**
   * @type {import('unified').Plugin<[Options?]|[Processor, Options?]>}
   */
  (
    /**
     * @param {Processor|Options} [destination]
     * @param {Options} [options]
     */
    function (destination, options) {
      /** @type {Options|undefined} */
      var settings
      /** @type {Processor|undefined} */
      var processor

      if (typeof destination === 'function') {
        processor = destination
        settings = options || {}
      } else {
        settings = destination || {}
      }

      if (settings.document === undefined || settings.document === null) {
        settings = Object.assign({}, settings, {document: true})
      }

      return processor ? bridge(processor, settings) : mutate(settings)
    }
  )

export default rehypeRemark

/**
 * Bridge-mode.
 * Runs the destination with the new mdast tree.
 * @param {Processor} destination
 * @param {Options} [options]
 * @returns {Transformer}
 */
function bridge(destination, options) {
  return transformer
  /** @type {Transformer} */
  function transformer(node, file, next) {
    destination.run(toMdast(node, options), file, done)
    /** @type {RunCallback} */
    function done(error) {
      // @ts-expect-error: `unified` should accept 1 arg for next.
      // See: <https://github.com/unifiedjs/unified/pull/141#issuecomment-871239574>
      next(error)
    }
  }
}

/**
 * Mutate-mode.
 * Further transformers run on the mdast tree.
 *
 * @param {Options} [options]
 * @returns {Transformer}
 */
function mutate(options) {
  return transformer
  /** @param {Node} node */
  function transformer(node) {
    return toMdast(node, options)
  }
}

// Remove the following JSDoc block when upgrading hast-util-to-mdast to version 8.
// Import these types from hast-util-to-mdast when version 8 released.
/**
 * @typedef {import('mdast').Content} MdastNode
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('hast').Element} Element
 *
 * @typedef Context
 * @property {Object.<string, Element>} nodeById
 * @property {boolean} baseFound
 * @property {string|null} frozenBaseUrl
 * @property {boolean} wrapText
 * @property {number} qNesting
 * @property {Object.<string, Handle>} handlers
 * @property {boolean|undefined} document
 * @property {string} checked
 * @property {string} unchecked
 * @property {Array.<string>} quotes
 *
 * @typedef {(node: Node, type: string, props?: Properties, children?: string|Array.<MdastNode>) => MdastNode} HWithProps
 * @typedef {(node: Node, type: string, children?: string|Array.<MdastNode>) => MdastNode} HWithoutProps
 * @typedef {Record<string, unknown>} Properties*
 * @typedef {HWithProps & HWithoutProps & Context} H
 * @typedef {(h: H, node: any, parent?: Parent) => MdastNode|Array.<MdastNode>|void} Handle
 *
 * @typedef Options
 * @property {Object.<string, Handle>} [handlers]
 * @property {boolean} [document]
 * @property {boolean} [newlines=false]
 * @property {string} [checked='[x]']
 * @property {string} [unchecked='[ ]']
 * @property {Array.<string>} [quotes=['"']]
 */
