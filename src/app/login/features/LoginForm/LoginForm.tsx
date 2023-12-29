import { RegexUtil } from '@dongjak-extensions/lang';
import { Button, Input, Space } from 'antd';
import React, { memo } from 'react';
import { regex, string } from 'valibot';

import Logo from '@/app/login/features/Logo/Logo';
import useValibot from '@/hooks/useValibot';

// 1.2 kB
interface LoginParams {
  code: string;
  phoneNumber: string;
}

const LoginForm = memo(() => {
  const [loginParams, _, handleChange, isValidated, errors] = useValibot(
    {
      phoneNumber: string([regex(RegexUtil.PHONE, '这不是一个有效的手机号')]),
      code: string([regex(RegexUtil.CODE_SIX, '验证码必须是6位数字')]),
    },
    { code: '', phoneNumber: '' } as LoginParams,
  );
  const handleSend = () => {
    isValidated((_) => {});
  };
  const handleSendCode = () => {
    isValidated((_) => {
      alert('发送验证码');
    });
  };
  return (
    <div className={'flex flex-col w-25% row-gap-1.5vh'} id={'LoginForm'}>
      <Logo />
      <button
        className="flex items-center rounded-1.5rem justify-center text-white bg-#373737 h-40px col-gap-5px"
        type={'button'}
      >
        <svg
          className={'w-[1.5em] h-[1.5em] fill-current'}
          p-id="1545"
          version="1.1"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M512 1024C229.23 1024 0 794.77 0 512S229.23 0 512 0s512 229.23 512 512-229.23 512-512 512z m107.91-626.371H640c-20.09-94.744-115.566-162.962-225.304-162.962-124.002 0-222.696 86.04-222.696 198.607 0 65.097 34.572 115.492 89.43 156.94l-23.114 71.12 77.995-41.448a354.748 354.748 0 0 0 77.97 11.8h20.114a133.608 133.608 0 0 1-5.851-47.47 193.122 193.122 0 0 1 57.466-134.412 181.37 181.37 0 0 1 133.096-52.175h0.804z m-115.273-56.296c15.848 0 28.696 14.288 28.696 31.915s-12.848 31.915-28.696 31.915c-17.652 1.95-33.402-12.313-35.304-31.94 0-22.284 17.457-31.89 34.719-31.89h0.585z m-171.032 63.878c-17.555 1.463-33.012-12.653-34.938-31.89 1.926-19.212 17.383-33.329 34.938-31.89 16.042 0 29.062 14.287 29.062 31.915 0 17.603-13.02 31.89-29.062 31.89zM832 574.805c0-92.233-90.136-169.472-192-169.472-107.764 0-192 77.24-192 169.448 0 92.257 84.456 169.496 192 169.496a264.24 264.24 0 0 0 66.828-11.873L767.586 768l-17.408-59.538c49.42-35.596 81.017-83.286 81.017-133.852l0.805 0.195zM573.562 554.52c-10.435 0-18.895-9.484-18.895-21.187s8.46-21.211 18.895-21.211c11.727-1.39 22.308 7.997 23.771 21.114-1.39 13.214-11.97 22.698-23.771 21.284z m128 0.098c-10.435 0-18.895-9.509-18.895-21.212 0-11.751 8.46-21.26 18.895-21.26 11.727-1.414 22.308 7.997 23.771 21.139-2.194 12.921-12.58 22.04-24.259 21.333h0.488z"
            fill="#0ABC64"
            p-id="1546"
          ></path>
        </svg>
        微信扫码登录
      </button>
      <button
        className="flex items-center rounded-1.5rem justify-center text-white bg-#373737 h-40px col-gap-5px"
        type={'button'}
      >
        <svg
          className={'w-[1.5em] h-[1.5em] fill-current'}
          height="200"
          p-id="2539"
          version="1.1"
          viewBox="0 0 1024 1024"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z"
            fill="#009FE8"
            p-id="2540"
          ></path>
        </svg>
        支付宝扫码登录
      </button>
      <div className="flex flex-row justify-center items-center py0.5rem">
        <hr className="h-[1px] border-0 bg-#313535 flex-1" />
        <div className="MainSignupLoginSection_orText__ssyEK">或者</div>
        <hr className="h-[1px] border-0 bg-#313535 flex-1" />
      </div>
      <Input
        onChange={handleChange('phoneNumber')}
        placeholder="请输入手机号"
        size="large"
        status={errors.errorPath === 'phoneNumber' ? 'error' : ''}
        value={loginParams.phoneNumber}
      />
      {errors.errorPath === 'phoneNumber' && (
        <div className="font-size-14px color-#e3567c">{errors.msg}</div>
      )}
      <Space.Compact size="large" style={{ width: '100%' }}>
        <Input
          onChange={handleChange('code')}
          placeholder="请输入验证码"
          status={errors.errorPath === 'code' ? 'error' : ''}
          value={loginParams.code}
        />
        <Button className={'m-l-5px'} onClick={handleSendCode}>
          发送验证码
        </Button>
      </Space.Compact>
      {errors.errorPath === 'code' && (
        <div className="font-size-14px color-#e3567c">{errors.msg}</div>
      )}
      <Button
        onClick={handleSend}
        style={{ backgroundColor: '#31316e', color: 'gray' }}
        type="text"
      >
        登 录
      </Button>

      <div className="py-2vh text-sm text-center text-gray-500 font-size-14px">
        继续使用，即表示您同意
        <br />
        Poe的
        <a href="https://poe.com/tos" rel="noreferrer" target="_blank">
          《服务条款》
        </a>
        和
        <a href="https://poe.com/privacy" rel="noreferrer" target="_blank">
          《隐私政策》
        </a>
        。
      </div>
    </div>
  );
});

export default LoginForm;
