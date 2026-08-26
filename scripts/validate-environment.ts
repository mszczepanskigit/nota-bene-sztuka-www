import process from 'node:process';
import { validateDeploymentConfig } from '../src/config/deploymentConfig';

validateDeploymentConfig(process.env);
