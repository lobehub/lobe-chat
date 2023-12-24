import React, { memo } from 'react';

const Logo = memo(() => {
  return (
    <div className={'flex items-center justify-center col-gap-10px'}>
      {/*<img className={"w-50px h-50px"} src='https://cdn.jsdelivr.net/gh/hhypygy/images@master/20231224/BgSub_11-(1).57k6ovin24g0.webp'/>*/}
      <span
        className={'font-synthesis-weight'}
        style={{
          fontFamily: 'Allura, handwriting',
          fontSize: '40px',
          fontWeight: 600,
        }}
      >
        HiChat
      </span>
    </div>
  );
});

export default Logo;
