import { Button, Highlighter, Text } from '@lobehub/ui-rn';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * 多语言支持演示
 * 展示语言切换和多种编程语言的高亮效果
 */
interface LanguageExample {
  code: string;
  lang: string;
  name: string;
}

interface CategoryData {
  languages: LanguageExample[];
  title: string;
}

type CategoryKey = 'frontend' | 'backend' | 'config';

export const LanguagesHighlighterDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('frontend');

  const languageCategories: Record<CategoryKey, CategoryData> = {
    backend: {
      languages: [
        {
          code: `from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import asyncio

app = FastAPI()

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    is_active: bool = True

class UserCreate(BaseModel):
    name: str
    email: str

# In-memory database
users_db: List[User] = []

async def get_user_by_id(user_id: int) -> User:
    """Async function to get user by ID"""
    await asyncio.sleep(0.1)  # Simulate database query
    for user in users_db:
        if user.id == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/users/", response_model=User)
async def create_user(user: UserCreate):
    new_user = User(
        id=len(users_db) + 1,
        name=user.name,
        email=user.email
    )
    users_db.append(new_user)
    return new_user

@app.get("/users/{user_id}", response_model=User)
async def read_user(user_id: int, user: User = Depends(get_user_by_id)):
    return user`,
          lang: 'python',
          name: 'Python FastAPI',
        },
        {
          code: `package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
)

type User struct {
    ID       int    \`json:"id"\`
    Name     string \`json:"name"\`
    Email    string \`json:"email"\`
    IsActive bool   \`json:"is_active"\`
}

var users []User
var nextID int = 1

func createUser(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    user.ID = nextID
    nextID++
    user.IsActive = true
    users = append(users, user)

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

func getUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    for _, user := range users {
        if user.ID == id {
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(user)
            return
        }
    }

    http.Error(w, "User not found", http.StatusNotFound)
}

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/users", createUser).Methods("POST")
    r.HandleFunc("/users/{id}", getUser).Methods("GET")

    fmt.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}`,
          lang: 'go',
          name: 'Go HTTP Server',
        },
      ],
      title: '后端开发',
    },
    config: {
      languages: [
        {
          code: `version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge`,
          lang: 'yaml',
          name: 'Docker Compose',
        },
        {
          code: `{
  "name": "react-native-highlighter",
  "version": "1.0.0",
  "description": "A powerful syntax highlighter for React Native",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "expo build",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@expo/vector-icons": "^13.0.0",
    "@shikijs/core": "^0.9.0",
    "expo": "~49.0.0",
    "expo-clipboard": "~4.3.0",
    "react": "18.2.0",
    "react-native": "0.72.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "@types/react-native": "~0.72.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.33.0",
    "jest": "^29.5.0",
    "typescript": "^5.1.0"
  },
  "keywords": [
    "react-native",
    "syntax-highlighting",
    "code-highlighter",
    "shiki",
    "expo"
  ],
  "author": "Your Name",
  "license": "MIT"
}`,
          lang: 'json',
          name: 'Package JSON',
        },
      ],
      title: '配置文件',
    },
    frontend: {
      languages: [
        {
          code: `import React, { useState } from 'react';
import { Button, Alert  } from 'react-native';

const Welcome = ({ name }) => {
  const [count, setCount] = useState(0);

  const handlePress = () => {
    setCount(count + 1);
    Alert.alert('Hello!', \`Welcome \${name}! Count: \${count + 1}\`);
  };

  return (
    <Button
      title={\`Hello \${name} (\${count})\`}
      onPress={handlePress}
    />
  );
};

export default Welcome;`,
          lang: 'jsx',
          name: 'React Component',
        },
        {
          code: `<template>
  <div class="counter">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment" :disabled="count >= 10">
      Increment
    </button>
    <button @click="reset" v-if="count > 0">
      Reset
    </button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  props: {
    title: {
      type: String,
      default: 'Counter'
    }
  },
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      if (this.count < 10) {
        this.count++
      }
    },
    reset() {
      this.count = 0
    }
  }
}
</script>`,
          lang: 'vue',
          name: 'Vue Component',
        },
        {
          code: `.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(31, 38, 135, 0.5);
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .card {
    width: 100%;
  }
}`,
          lang: 'css',
          name: 'Styled CSS',
        },
      ],
      title: '前端开发',
    },
  };

  const categories: CategoryKey[] = ['frontend', 'backend', 'config'];
  const currentCategory = languageCategories[selectedCategory];

  const styles = StyleSheet.create({
    activeCategoryButton: {
      backgroundColor: '#1890ff',
      borderColor: '#1890ff',
    },
    activeCategoryButtonText: {
      color: '#fff',
    },
    categoryButton: {
      backgroundColor: '#f0f0f0',
      borderColor: '#d9d9d9',
      borderRadius: 20,
      borderWidth: 1,
      paddingBlock: 8,
      paddingInline: 16,
    },
    categoryButtonText: {
      color: '#666',
      fontSize: 14,
      fontWeight: '500',
    },
    categoryContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 24,
    },
    categoryTitle: {
      color: '#333',
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 20,
    },
    container: {
      padding: 16,
    },
    description: {
      color: '#666',
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 24,
    },
    exampleContainer: {
      marginBottom: 32,
    },
    exampleTitle: {
      color: '#333',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    interactiveContainer: {
      backgroundColor: '#fff2e8',
      borderLeftColor: '#fa8c16',
      borderLeftWidth: 4,
      borderRadius: 8,
      marginBottom: 24,
      marginTop: 24,
      padding: 16,
    },
    interactiveDescription: {
      color: '#d46b08',
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 16,
    },
    interactiveTitle: {
      color: '#fa8c16',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    supportContainer: {
      backgroundColor: '#f0f9ff',
      borderLeftColor: '#1890ff',
      borderLeftWidth: 4,
      borderRadius: 8,
      padding: 16,
    },
    supportText: {
      color: '#0050b3',
      fontSize: 14,
      lineHeight: 20,
    },
    supportTitle: {
      color: '#1890ff',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    title: {
      color: '#1a1a1a',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>多语言支持</Text>
      <Text style={styles.description}>展示不同编程语言的语法高亮效果，支持语言动态切换功能。</Text>

      {/* 分类选择 */}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <Button
            key={category}
            onPress={() => setSelectedCategory(category)}
            size="small"
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategoryButton,
            ]}
            type={selectedCategory === category ? 'primary' : 'default'}
          >
            {languageCategories[category].title}
          </Button>
        ))}
      </View>

      {/* 语言示例 */}
      <Text style={styles.categoryTitle}>{currentCategory.title}</Text>

      {currentCategory.languages.map((example, index) => (
        <View key={index} style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>{example.name}</Text>
          <Highlighter
            allowChangeLanguage
            code={example.code}
            copyable
            fileName={`example.${example.lang}`}
            fullFeatured
            lang={example.lang}
          />
        </View>
      ))}

      {/* 语言切换演示 */}
      <View style={styles.interactiveContainer}>
        <Text style={styles.interactiveTitle}>🔄 交互式语言切换</Text>
        <Text style={styles.interactiveDescription}>点击工具栏中的语言名称可以切换高亮语言</Text>
        <Highlighter
          allowChangeLanguage
          code={`function hello(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to \${name} world!\`;
}

const message = hello('Programming');
console.log(message);`}
          copyable
          fileName="demo.js"
          fullFeatured
          lang="javascript"
        />
      </View>

      <View style={styles.supportContainer}>
        <Text style={styles.supportTitle}>支持的语言类型：</Text>
        <Text style={styles.supportText}>
          • 🌐 前端：JavaScript, TypeScript, React, Vue, Angular{'\n'}• 🖥️ 后端：Python, Java, Go,
          Rust, C#, PHP, Ruby{'\n'}• 📱 移动端：Swift, Kotlin, Dart, Objective-C{'\n'}• 🎨
          样式：CSS, SCSS, Less, Stylus{'\n'}• 📄 标记：HTML, XML, Markdown, LaTeX{'\n'}• ⚙️
          配置：JSON, YAML, TOML, INI{'\n'}• 🔧 工具：Bash, PowerShell, Dockerfile{'\n'}• 🗄️
          数据库：SQL, GraphQL, MongoDB
        </Text>
      </View>
    </View>
  );
};

export default LanguagesHighlighterDemo;
