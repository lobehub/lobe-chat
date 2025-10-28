import { BR } from '@expo/html-elements';
import { Components } from 'react-markdown';

import A from './components/A';
import BlockQuote from './components/BlockQuote';
import Code from './components/Code';
import Del from './components/Del';
import Div from './components/Div';
import EM from './components/EM';
import HR from './components/HR';
import { H1, H2, H3, H4, H5, H6 } from './components/Header';
import Html from './components/Html';
import Img from './components/Img';
import Input from './components/Input';
import Ins from './components/Ins';
import Kbd from './components/Kbd';
import { LI, OL, UL } from './components/List';
import P from './components/P';
import Pre from './components/Pre';
import Span from './components/Span';
import Strong from './components/Strong';
import Sub from './components/Sub';
import Sup from './components/Sup';
import { TBody, TD, TFoot, TH, THead, TR, Table } from './components/Table';
import Text from './components/Text';
import Time from './components/Time';

export const useComponents = (): Components => {
  return {
    a: A,
    b: Strong,
    blockquote: BlockQuote,
    br: () => <BR />,
    code: Code,
    del: Del,
    div: Div,
    em: EM,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    hr: HR,
    html: Html,
    i: EM,
    img: Img,
    input: Input,
    ins: Ins,
    kbd: Kbd,
    li: LI,
    ol: OL,
    p: P,
    pre: Pre,
    section: Div,
    span: Span,
    strong: Strong,
    sub: Sub,
    sup: Sup,
    table: Table,
    tbody: TBody,
    td: TD,
    text: Text,
    tfoot: TFoot,
    th: TH,
    thead: THead,
    time: Time,
    tr: TR,
    u: Ins,
    ul: UL,
  };
};
