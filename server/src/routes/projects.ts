/**
 * Projects API 路由
 *
 * 管理项目和制品
 */

import { Router } from 'express';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const router = Router();

/**
 * GET /api/projects
 *
 * 获取所有项目列表
 */
router.get('/', (req, res) => {
  try {
    const projectsDir = join(process.cwd(), 'projects');

    if (!existsSync(projectsDir)) {
      return res.json({ projects: [] });
    }

    const projects = readdirSync(projectsDir)
      .filter(name => {
        const path = join(projectsDir, name);
        return statSync(path).isDirectory();
      })
      .map(sessionId => {
        const projectPath = join(projectsDir, sessionId);
        const metadataPath = join(projectPath, 'artifacts', 'project.json');

        let metadata = null;
        if (existsSync(metadataPath)) {
          metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
        }

        return {
          sessionId,
          projectPath,
          metadata,
        };
      });

    res.json({ projects });

  } catch (error) {
    console.error('Projects list error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '获取项目列表时出错'
    });
  }
});

/**
 * GET /api/projects/:sessionId
 *
 * 获取指定项目详情
 */
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const projectPath = join(process.cwd(), 'projects', sessionId);

    if (!existsSync(projectPath)) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const metadataPath = join(projectPath, 'artifacts', 'project.json');

    if (!existsSync(metadataPath)) {
      return res.status(404).json({ error: '项目元数据不存在' });
    }

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

    res.json({
      sessionId,
      projectPath,
      metadata,
    });

  } catch (error) {
    console.error('Project details error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '获取项目详情时出错'
    });
  }
});

/**
 * GET /api/projects/:sessionId/artifacts/:type
 *
 * 获取指定制品
 */
router.get('/:sessionId/artifacts/:type', (req, res) => {
  try {
    const { sessionId, type } = req.params;
    const projectPath = join(process.cwd(), 'projects', sessionId);
    const artifactsPath = join(projectPath, 'artifacts');

    if (!existsSync(artifactsPath)) {
      return res.status(404).json({ error: '制品目录不存在' });
    }

    // 根据类型返回不同的制品
    let artifactPath: string;
    let contentType: string;

    switch (type) {
      case 'design':
        artifactPath = join(artifactsPath, 'DESIGN.md');
        contentType = 'text/markdown';
        break;
      case 'strategy':
        artifactPath = join(artifactsPath, 'STRATEGY.md');
        contentType = 'text/markdown';
        break;
      case 'storyboard':
        artifactPath = join(artifactsPath, 'STORYBOARD.md');
        contentType = 'text/markdown';
        break;
      case 'timeline':
        artifactPath = join(artifactsPath, 'timeline.json');
        contentType = 'application/json';
        break;
      case 'validation':
        artifactPath = join(artifactsPath, 'validation-report.json');
        contentType = 'application/json';
        break;
      default:
        return res.status(400).json({ error: '不支持的制品类型' });
    }

    if (!existsSync(artifactPath)) {
      return res.status(404).json({ error: '制品文件不存在' });
    }

    const content = readFileSync(artifactPath, 'utf-8');

    res.set('Content-Type', contentType);
    res.send(content);

  } catch (error) {
    console.error('Artifact fetch error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '获取制品时出错'
    });
  }
});

export default router;
