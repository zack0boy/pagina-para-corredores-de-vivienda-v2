import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { LeadsService } from './lead.service';
import { AdminGuard } from './guards/admin.guard';

import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ReassignLeadDto } from './dto/reassign-lead.dto';
import { MoveLeadDto } from './dto/move-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
  ) {}

  @Post()
  create(
    @Body()
    createLeadDto: CreateLeadDto,
  ) {
    return this.leadsService.create(
      createLeadDto,
    );
  }

  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(
      id,
      updateLeadDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.leadsService.remove(id);
  }

  /**
   * ADMIN: Reasignar lead a otro corredor
   * PATCH /leads/:id/reassign-corredor
   */
  @UseGuards(AdminGuard)
  @Patch(':id/reassign-corredor')
  reassignCorredor(
    @Param('id')
    id: string,

    @Body()
    reassignLeadDto: ReassignLeadDto,
  ) {
    return this.leadsService.reassignCorredor(
      id,
      reassignLeadDto.corredor_id,
    );
  }

  /**
   * ADMIN: Mover lead a otra propiedad
   * PATCH /leads/:id/move-propiedad
   */
  @UseGuards(AdminGuard)
  @Patch(':id/move-propiedad')
  moveToProperty(
    @Param('id')
    id: string,

    @Body()
    moveLeadDto: MoveLeadDto,
  ) {
    return this.leadsService.moveToProperty(
      id,
      moveLeadDto.propiedad_id,
    );
  }
}