import { CommandFactory } from 'nest-commander';
import { CLIModule } from './cli.module';

async function bootstrap() {
  await CommandFactory.run(CLIModule);
}
bootstrap();
