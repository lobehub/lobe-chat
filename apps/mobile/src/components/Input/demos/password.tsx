import { Button, Flexbox, Input, Text, useTheme } from '@lobehub/ui-rn';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { useCallback, useState } from 'react';

const PasswordDemo = () => {
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  // 密码强度检查
  const getPasswordStrength = useCallback((pwd: string) => {
    if (pwd.length < 6) return { level: 'weak', text: '弱' };
    if (pwd.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
      return { level: 'medium', text: '中' };
    }
    return { level: 'strong', text: '强' };
  }, []);

  const passwordStrength = getPasswordStrength(password);

  // 密码验证规则
  const validations = [
    { rule: '至少6个字符', valid: password.length >= 6 },
    { rule: '包含大小写字母', valid: /(?=.*[a-z])(?=.*[A-Z])/.test(password) },
    { rule: '包含数字', valid: /\d/.test(password) },
    { rule: '两次密码一致', valid: password && password === confirmPassword },
  ];

  return (
    <Flexbox gap={16}>
      <Text>基础密码输入</Text>
      <Text>支持密码显示/隐藏切换，点击眼睛图标</Text>
      <Input.Password placeholder="请输入密码" />
      <Input.Password placeholder="请再次输入密码" />

      <Text>不同场景的密码框</Text>
      <Input.Password placeholder="当前密码" />
      <Input.Password placeholder="新密码" />
      <Input.Password placeholder="确认新密码" />

      <Text>登录表单示例</Text>

      <Input onChangeText={setUsername} placeholder="用户名或邮箱" value={username} />
      <Input.Password onChangeText={setPassword} placeholder="密码" value={password} />
      <Button block type="primary">
        登录
      </Button>

      <Text>密码强度检测</Text>
      <Text>实时检测密码强度和验证规则</Text>

      <Input.Password onChangeText={setPassword} placeholder="设置新密码" value={password} />

      {password && (
        <>
          <Text>密码强度: </Text>
          <Text type={'danger'}>{passwordStrength.text}</Text>
        </>
      )}

      <Input.Password
        onChangeText={setConfirmPassword}
        placeholder="确认密码"
        value={confirmPassword}
      />

      {password && (
        <>
          {validations.map((validation, index) => (
            <Flexbox gap={4} horizontal key={index}>
              {validation.valid ? (
                <CheckCircle color={theme.colorSuccess} size={16} />
              ) : (
                <XCircle color={theme.colorError} size={16} />
              )}
              <Text>{validation.rule}</Text>
            </Flexbox>
          ))}
        </>
      )}
    </Flexbox>
  );
};

export default PasswordDemo;
