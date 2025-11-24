// import { Controller, Get, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { ApiBearerAuth } from '@nestjs/swagger';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @ApiBearerAuth()
//   @UseGuards(AuthGuard('jwt'))
//   @Get()
//   getHello(): string {
//     console.log('Request headers received');
//     return this.appService.getHello();
//   }
// }

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Information' })
  getApiInfo() {
    return {
      message: 'GTCO Virtual Card Management System API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api',
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          profile: 'GET /auth/profile (protected)',
        },
        accounts: {
          balance: 'GET /accounts/balance (protected)',
          summary: 'GET /accounts/summary (protected)',
          addBalance: 'POST /accounts/add-balance (protected)',
          fund: 'POST /accounts/fund (protected)',
          withdraw: 'POST /accounts/withdraw (protected)',
        },
        cards: {
          list: 'GET /cards (protected)',
          get: 'GET /cards/:id (protected)',
          details: 'GET /cards/:id/details (protected)',
          createVirtual: 'POST /cards/create-virtual (protected)',
          requestPhysical: 'POST /cards/request-physical (protected)',
          fund: 'POST /cards/:id/fund (protected)',
          spend: 'POST /cards/:id/spend (protected)',
          freeze: 'PATCH /cards/:id/freeze (protected)',
          unfreeze: 'PATCH /cards/:id/unfreeze (protected)',
          block: 'PATCH /cards/:id/block (protected)',
          delete: 'DELETE /cards/:id (protected)',
        },
        transactions: {
          list: 'GET /transactions (protected)',
          recent: 'GET /transactions/recent (protected)',
          stats: 'GET /transactions/stats (protected)',
          get: 'GET /transactions/:id (protected)',
          card: 'GET /transactions/card/:cardId (protected)',
        },
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    };
  }
}
