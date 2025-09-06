import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';

import TextInput from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginBottom: token.marginSM,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadius,
    justifyContent: 'center',
    marginTop: token.marginSM,
    paddingVertical: token.paddingMD,
  },
  loginButtonText: {
    color: token.colorBgContainer,
    fontSize: token.fontSize,
    fontWeight: '600',
  },
  loginForm: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600',
    marginBottom: token.marginXS,
    marginTop: token.marginMD,
  },
  strengthIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginTop: token.marginXS,
  },
  strengthMedium: {
    color: token.colorWarning,
  },
  strengthStrong: {
    color: token.colorSuccess,
  },
  strengthText: {
    fontSize: token.fontSizeSM,
  },
  strengthWeak: {
    color: token.colorError,
  },
  validationInvalid: {
    color: token.colorError,
  },
  validationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginTop: token.marginXXS,
  },
  validationText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
  },
  validationValid: {
    color: token.colorSuccess,
  },
}));

const PasswordDemo = () => {
  const { styles, token } = useStyles();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [username, setUsername] = React.useState('');

  // 密码强度检查
  const getPasswordStrength = React.useCallback((pwd: string) => {
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

  const getStrengthStyle = (level: string) => {
    switch (level) {
      case 'weak': {
        return styles.strengthWeak;
      }
      case 'medium': {
        return styles.strengthMedium;
      }
      case 'strong': {
        return styles.strengthStrong;
      }
      default: {
        return {};
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>基础密码输入</Text>
      <Text style={styles.description}>支持密码显示/隐藏切换，点击眼睛图标</Text>
      <TextInput.Password placeholder="请输入密码" />
      <TextInput.Password placeholder="请再次输入密码" />

      <Text style={styles.sectionTitle}>不同场景的密码框</Text>
      <TextInput.Password placeholder="当前密码" />
      <TextInput.Password placeholder="新密码" />
      <TextInput.Password placeholder="确认新密码" />

      <Text style={styles.sectionTitle}>登录表单示例</Text>
      <View style={styles.loginForm}>
        <TextInput onChangeText={setUsername} placeholder="用户名或邮箱" value={username} />
        <TextInput.Password onChangeText={setPassword} placeholder="密码" value={password} />

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>登录</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>密码强度检测</Text>
      <Text style={styles.description}>实时检测密码强度和验证规则</Text>

      <TextInput.Password onChangeText={setPassword} placeholder="设置新密码" value={password} />

      {password && (
        <View style={styles.strengthIndicator}>
          <Text style={styles.strengthText}>密码强度: </Text>
          <Text style={[styles.strengthText, getStrengthStyle(passwordStrength.level)]}>
            {passwordStrength.text}
          </Text>
        </View>
      )}

      <TextInput.Password
        onChangeText={setConfirmPassword}
        placeholder="确认密码"
        value={confirmPassword}
      />

      {password && (
        <View>
          {validations.map((validation, index) => (
            <View key={index} style={styles.validationItem}>
              {validation.valid ? (
                <CheckCircle color={token.colorSuccess} size={16} />
              ) : (
                <XCircle color={token.colorError} size={16} />
              )}
              <Text
                style={[
                  styles.validationText,
                  validation.valid ? styles.validationValid : styles.validationInvalid,
                ]}
              >
                {validation.rule}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PasswordDemo;
